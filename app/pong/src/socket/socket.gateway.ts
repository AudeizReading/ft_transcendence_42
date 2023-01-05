import { UseGuards } from '@nestjs/common';
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
import { DataGame, DataElement } from './dep/minirt_functions'

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
  game: Game & {
    players: PlayerGame[]
  }
};

// https://docs.nestjs.com/websockets/gateways
// https://codesandbox.io/s/xingyibiaochatserver-6x1jc?file=/src/main.ts


interface PlayGame {
  pGame: Game;
  data: DataGame;
  users: number[];
}

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
    let pGame: Game & ({ players: PlayerGame[] }) | null = null; // Prisma

    // STEP 1: Try to connect
    if (socket.handshake?.query?.gameid == 'mygame' && user.playingAt) {
      pGame = user.playingAt.game;
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
          user.playingAt.game = pGame = await this.gameService.updateGame({
            data: {
              state: 'PLAYING',
            },
            where: {
              id: client.gameId,
            },
          });
          logicState = 'STARTING';
        }
        socket.to(`game-${client.gameId}`);
      } else {
        console.log('Elle a déjà commencé, tu es en retard !');
        logicState = 'PLAYING';
      }
    }

    if (!pGame || client.gameId < 0)
      return ;

    let game: PlayGame = this.games.get(client.gameId);
    if (game) {
      game.users.push(user.id);
    } else {
      const angle = Math.PI/180 * (Math.random() * 120 - 60)
      game = {
        pGame: pGame,
        data: {
          players: [
            { dir: 0, pos: 140, speed: 250, size: 40, at: null },
            { dir: 0, pos: 140, speed: 250, size: 40, at: null },
          ],
          ball: {
            dir: {
              x: Math.cos(angle),
              y: Math.sin(angle)
            }, pos: { x: 200, y: 150 }, speed: 250, size: 6, at: null
          }
        },
        users: [user.id],
      }
      this.games.set(client.gameId, game);
    }

    socket.join(`game-${client.gameId}`);
    if (logicState === 'STARTING')
      socket.to(`game-${client.gameId}`).emit('dataGame', game.data);
    else if (logicState === 'PLAYING')
      socket.emit('dataGame', game.data);

    //console.log(this.games);
    return {
      // not send ??
      success: true,
      gameid: client.gameId,
    };
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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('move')
  async move(
    @MessageBody() data: DataElement,
    @ConnectedSocket() socket: SocketUserAuth,
  ) {
    const client = this.clients.get(socket.id);
    if (!client || !client.gameId)
      return ;

    const game = this.games.get(client.gameId);
    if (!game || game.users.indexOf(client.userId) === -1)
      return ;

    const pGame = game.pGame as Game & { players: PlayerGame[] };
    const playerId: number = +(client.userId > pGame.players[0].userId);

    //TODO: ANTICHEAT & CHECK DATA
    game.data.players[playerId] = data;
    socket.to(`game-${client.gameId}`).emit('dataGame', game.data);

    console.log('move player', playerId, data);
  }

  /*private getUserInfoBySId(sessionId: string) {
    let sender: string;
    let roomName: string;
    this.roomMap.forEach((room, key) => {
      room.forEach(user => {
        if (user.sessionId === sessionId) {
          sender = user.userName;
          roomName = key;
        }
      });
    });

    return {
      sender,
      roomName,
    };
  }*/

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

  /*@SubscribeMessage('login')
  handlerLogin(
    socket: Socket,
    payload: { login: string, sessionid: string },
  )/*: { success: boolean; isPublisher?: boolean }* / {
    console.log('??')
    /*const [userName, roomName] = payload;
    try {
      socket.join(roomName);
      const sessionId = socket.id;
      const userRoom = this.roomMap.get(roomName);
      let isListener = true;

      // 去重
      if (Array.isArray(userRoom)) {
        userRoom.forEach((u , i) => {
          if (u.userName === userName) {
            userRoom.splice(i, 1);
          }
        });
      }
      isListener = Array.isArray(userRoom) && userRoom.length > 0;
      const room = this.roomMap.get(roomName);
      const user: UserInfo = {
        sessionId,
        userName,
        roomName,
      };
      if (room) {
        room.push(user);
      } else {
        this.roomMap.set(roomName, [user]);
      }
      return { success: true, isPublisher: !isListener };
    } catch (e) {
      console.error(e);
      return { success: false };
    }* /
  }*/

  /*@SubscribeMessage('chat')
  handlerChat(socket: Socket, msg: string) {
    const { sender, roomName } = this.getUserInfoBySId(socket.id);

    if (!sender) return;
    socket.to(roomName).emit('chat', msg);
    return msg;
  }*/
}
