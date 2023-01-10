import { UseGuards, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Socket, Server } from 'socket.io';
import { fromAuthHeaderOAsBearerToken } from '../auth/jwt.strategy';
import { GameService } from './game.service';
import { User, Game, PlayerGame } from '@prisma/client';
import { DataGame, DataElement, DataUser, Point, pl_intersect,
         Plane, pl_time_to_vector, check_segment_collision, v_norm } from './dep/minirt_functions'

interface Client {
  userId: number;
  gameId: number;
  socketId: string;
};

interface pingpongData {
  first: number;
  second: number;
  third: number;
  fourth: number;
  fifth: number;
};

type SocketUserAuth = Socket & {
  user: User;
};

type PlayerGameInclude = PlayerGame & {
  game: Game;
  user: User;
};

type GameInclude = Game & {
  players: PlayerGameInclude[];
};

// https://docs.nestjs.com/websockets/gateways
// https://codesandbox.io/s/xingyibiaochatserver-6x1jc?file=/src/main.ts

const DEFAULT_BALL_SPEED = 130;

interface PlayGame {
  pGame: Game;
  data: DataGame;
  timeout: ReturnType<typeof setTimeout>;
  users: number[];
}

function getPlayerPosition(player: DataElement): number {
  if (player.at !== null && player.dir !== 0) {
    // https://stackoverflow.com/q/153507/
    const time = (+new Date() - +player.at) / 1000;
    const speed = player.speed * (player.dir as number);
    const delta = (1 / 2) * speed * (time * time);
    return Math.min(300 - player.size, Math.max(0, (player.pos as number) + delta));
  } else {
    return player.pos as number;
  }
}

@Injectable()
@WebSocketGateway(8192, {
  namespace: 'game',
  cors: {
    origin: '*',
    maxAge: 600,
  },
})
export class GameSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
    private gameService: GameService,
  ) {}

  @WebSocketServer()
  private server: Server;

  private clients: Map<string, Client> = new Map();

  private games: Map<number, PlayGame> = new Map();

  private async getUserWithToken(socket: Socket) {
    const token = fromAuthHeaderOAsBearerToken(socket);
    return await (async () => {
      try {
        return this.jwtStrategy.validate(
          await this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
          }),
        );
      } catch (e) {
        if (e.name !== 'JsonWebTokenError') console.error(e); // show other error
        return null;
      }
    })();
  }

  refreshBall(socket: Socket, game: PlayGame, pos: Point, angle: number, deltaTime?: number, speed?: number) {
    game.data.ball.speed = (speed) ? speed : DEFAULT_BALL_SPEED;
    game.data.ball.pos = pos;
    game.data.ball.dir = { x: Math.cos(angle), y: Math.sin(angle) };
    game.data.ball.at = +new Date() + (deltaTime || 0);

    this.planeCollisionChecking(socket, game);
    socket.to(`game-${game.pGame.id}`).emit('dataGame', game.data);
    socket.emit('dataGame', game.data);
  }

  planeCollisionChecking(socket: Socket, game: PlayGame) {
    if (game.data.ball.at === null)
      return ;
    const planes: Plane[] = [{
      n: { x: 1, y: 0 },
      pos: { x: 20, y: getPlayerPosition(game.data.players[0]) as number },
      size: game.data.players[0].size
    }, {
      n: { x: -1, y: 0 },
      pos: { x: 400 - 20, y: getPlayerPosition(game.data.players[1]) as number },
      size: game.data.players[1].size
    }];
    const a: Point = game.data.ball.pos as Point;
    const dir: Point = v_norm(game.data.ball.dir as Point);
    const speed: number = game.data.ball.speed;
    const b: Point = { x: a.x + speed * dir.x, y: a.y + speed * dir.y }
    let time: number = -1;

    for (let i: number = 0; i < planes.length; i++) {
      if ((time = pl_intersect(a, b, planes[i])) > -1) {
        const ms: number = game.data.ball.at + time * 1000 - +new Date();
        if (time > 10) {
          console.log('recalcul.');
          const angle: number = Math.PI / 180 * (Math.random() * 120 - 60 - ((!i) ? 180 : 0));
          this.refreshBall(socket, game, game.data.ball.pos as Point, angle,
            Math.min(0, game.data.ball.at - +new Date()), game.data.ball.speed);
          break;
        }
        if (ms <= 0)
          break;
        clearTimeout(game.timeout);
        game.timeout = setTimeout(() => {
          const point: Point = pl_time_to_vector(a, b, time);
          if (point && !(0 <= point.y && point.y <= 300)) {
            point.y = Math.abs(point.y);
            const pair: number = Math.floor(point.y / 300) % 2;
            point.y = point.y % 300;
            if (pair) 
              point.y = 300 - point.y;
          }
          if (check_segment_collision(planes[i], point)) {
            const size: number = (planes[i].size || 0);
            let dist: number = (point.y - planes[i].pos.y + 3) / (size + 6) * 160; // 3 et 6 == rayon/diametre de la balle
            if (Math.sign(planes[i].n.x) < 0)
              dist = (160 - dist) - 180;
            this.refreshBall(socket, game, point, Math.PI / 180 * (dist - 80), 0, game.data.ball.speed + 10);
          }
          else {
            const angle: number = Math.PI / 180 * (Math.random() * 120 - 60 - ((i) ? 180 : 0));

            game.data.points[+!i]++; // TODO: Update database
            this.gameService.updateGame({
              data: {
                scoreA: game.data.points[0],
                scoreB: game.data.points[1]
              },
              where: {
                id: game.pGame.id
              }
            }).then((pGame) => {
              game.pGame = pGame;
            });

            // Calc time distance between player and goal (x: 20 -> 0 || x: 380 -> 400)
            const a: Point = point;
            const b: Point = { x: a.x + speed * dir.x, y: a.y + speed * dir.y };
            const plane: Plane = planes[i];
            plane.pos.x = (i) ? 400 : 0;
            const time: number = pl_intersect(a, b, planes[i]);
            const real_ms = Math.min(2.4, time) * 1000;

            setTimeout(() =>
              this.refreshBall(socket, game, { x: 200, y: 150 }, angle, 3000)
            , real_ms);
          }
        }, ms);
        break ;
      } else if (time < 0 && i + 1 === planes.length) {
        console.log('impossible!');
        const angle: number = Math.PI / 180 * (Math.random() * 120 - 60 - ((i) ? 180 : 0));
        this.refreshBall(socket, game, { x: 200, y: 150 }, angle, 3000);
      }
    }
  }

  // @UseGuards(JwtAuthGuard) <== Not supported for handleConnection
  async handleConnection(socket: Socket) {
    const user = await this.getUserWithToken(socket);
    if (!user) {
      // && demo) ??? ---> pouvoir laisser voir la demo aux hors-lignes
      socket.disconnect();
      return { success: false, gameid: -1 };
    }
    const iterator1 = this.clients[Symbol.iterator]();

    for (const item of iterator1) {
      if (item[1].userId === user.id) {
        console.log('double connexion!');
        socket.disconnect();
        return { success: false, gameid: -1 };
      }
    }
    console.log(user.name, 'has join.');

    const client: Client = {
      userId: user.id,
      gameId: 0,
      socketId: socket.id,
    };
    this.clients.set(client.socketId, client);

    /*console.log('👇️ total:', this.clients.size);
    this.clients.forEach((client, id) => {
      console.log(id, client);
    });*/

    let logicState = '';
    let pGame: Game & { players: (PlayerGame & { user: User; })[]; } | null = null; // Prisma

    // STEP 1: Try to connect
    if (socket.handshake?.query?.gameid == 'mygame' && user.playingAt) {
      pGame = user.playingAt.game as GameInclude;
      client.gameId = pGame.id;
      console.log('Est-ce que la game peut commencer ?');
      if (pGame.state === 'WAITING') {
        const oppId = (() => {
          const players = pGame.players.filter(
            (a) => a.userId !== user.id,
          );
          if (players[0]) return players[0].userId;
          else return -1;
        })();
        const users = [...this.clients].filter(
          ([key, val]) => val.userId === oppId,
        );
        if (users.length <= 0) {
          console.log('Il vous manque encore un opposant !', oppId);
        } else {
          console.log('oui');
          pGame = await this.gameService.updateGame({
            data: {
              state: 'PLAYING',
            },
            where: {
              id: client.gameId,
            },
          });
          logicState = 'STARTING';
        }
      } else {
        console.log('Elle a déjà commencé, tu es en retard !');
        logicState = 'PLAYING';
      }
    } else if (!isNaN(parseInt(socket.handshake?.query?.gameid as string))) {
      pGame = await this.gameService.game({
        id: parseInt(socket.handshake?.query?.gameid as string)
      });
      client.gameId = pGame.id;
      logicState = pGame.state;
    }

    if (!pGame || client.gameId < 0)
      return ;

    let game: PlayGame = this.games.get(client.gameId);
    if (game) {
      game.users.push(user.id);
    } else {
      const angle = Math.PI / 180 * (Math.random() * 120 - 60 - 180); // TODO: Side random
      game = {
        pGame: pGame,
        data: {
          users: pGame.players.map((player): DataUser => ({
            id: player.user.id,
            name: player.user.name,
            avatar: user.avatar.replace(
              '://<<host>>',
              '://' + process.env.FRONT_HOST,
            ),
          })) as DataUser[],
          points: [pGame.scoreA, pGame.scoreB],
          players: [
            { dir: 0, pos: 140, speed: 250, size: 40, at: null },
            { dir: 0, pos: 140, speed: 250, size: 40, at: null },
          ],
          ball: {
            dir: {
              x: Math.cos(angle),
              y: Math.sin(angle)
            }, pos: { x: 200, y: 150 }, speed: DEFAULT_BALL_SPEED, size: 6, at: null
          }
        },
        users: [user.id],
        timeout: 0 as any,
      };
      this.games.set(client.gameId, game);
    }

    if (logicState === 'STARTING' || logicState === 'PLAYING') {
      if (game.data.ball.at === null) {
        console.log('ball go!')
        game.data.ball.at = +new Date() + 10000;
      }
    }

    this.planeCollisionChecking(socket, game);

    socket.join(`game-${client.gameId}`);
    if (logicState === 'STARTING')
      socket.to(`game-${client.gameId}`).emit('dataGame', game.data);
    else if (logicState === 'PLAYING')
      socket.emit('dataGame', game.data);
  }

  @UseGuards(JwtAuthGuard)
  async handleDisconnect(@ConnectedSocket() socket: SocketUserAuth) {
    const user = await this.getUserWithToken(socket);
    if (!this.clients.get(socket.id)) return;
    this.clients.delete(socket.id);
    if (user) {
      this.games.forEach((game, gameId) => {
        game.users.forEach((userId) => {
          if (userId === user.id) {
            console.log('disconnected of game ', gameId);
            game.users = game.users.filter((a) => a != userId);
            this.games.set(gameId, game);
          }
        });
      });
      console.log(user.name + ' has left.');
    }
  }

  //@UseGuards(JwtAuthGuard) <=== Rajoute bcp trop de latence!
  @SubscribeMessage('data')
  async data(
    @ConnectedSocket() socket: SocketUserAuth,
  ) {
    const client = this.clients.get(socket.id);
    if (!client || !client.gameId)
      return ;

    const game = this.games.get(client.gameId);
    if (!game || game.users.indexOf(client.userId) === -1)
      return ;

    return game.data;
  }

  //@UseGuards(JwtAuthGuard) <=== Rajoute bcp trop de latence!
  @SubscribeMessage('move')
  async move(
    @MessageBody() data: DataElement,
    @ConnectedSocket() socket: SocketUserAuth,
  ) {
    const diff: number = +new Date() - data.at;
    const client = this.clients.get(socket.id);
    if (!client || !client.gameId)
      return ;

    const game = this.games.get(client.gameId);
    if (!game || game.users.indexOf(client.userId) === -1)
      return ;

    const pGame = game.pGame as Game & { players: PlayerGame[] };
    const playerId: number = +(client.userId > pGame.players[0].userId);

    if (pGame.players[playerId].userId !== client.userId) {
      console.log('tricheur?');
      return ;
    }

    this.planeCollisionChecking(socket, game);

    //TODO: ANTICHEAT & CHECK DATA
    game.data.players[playerId] = data;
    socket.to(`game-${client.gameId}`).emit('dataGame', game.data);

    console.log('move player', playerId, data);

    return diff
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('ping')
  async ping(
    @MessageBody() data: pingpongData,
    //@ConnectedSocket() socket: SocketUserAuth,
  ) {
    data.second = +new Date();
    return data;
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('pong')
  async pong(
    @MessageBody() data: pingpongData,
    //@ConnectedSocket() socket: SocketUserAuth,
  ) {
    data.fourth = +new Date();
    return data;
  }
}
