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
import { User, Game } from '@prisma/client';

interface Client {
  userId: number
  socketId: string
}

interface pingpongData {
  first: number
  second: number
  third: number
  fourth: number
  fifth: number
}

type SocketUserAuth = Socket & {
  user: User
};

// https://docs.nestjs.com/websockets/gateways
// https://codesandbox.io/s/xingyibiaochatserver-6x1jc?file=/src/main.ts

interface PlayGame {
  game: Game
  users: number[]
}

@WebSocketGateway(8192, {
  namespace: 'game',
  cors: {
    origin: '*',
    maxAge: 600,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private jwtStrategy: JwtStrategy,
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
        console.log('double connexion!')
        socket.disconnect();
        return { success: false, gameid: -1 };
      }
    }
    console.log(user.name, 'has join.');

    const client: Client = {
      userId: user.id,
      socketId: socket.id,
    };
    this.clients.set(client.socketId, client);

    /*console.log('👇️ total:', this.clients.size);
    this.clients.forEach((client, id) => {
      console.log(id, client);
    });*/

    let gameId = -1;

    if (socket.handshake?.query?.gameid == 'mygame' && user.playingAt) {
      console.log('Est-ce que la game peut commencer ?');
      if (user.playingAt.game.state === 'WAITING') {
        const oppId = (() => {
          const players = user.playingAt.game.players.filter(
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
        }
        gameId = user.playingAt.gameId;
      } else {
          console.log('Elle a déjà commencé, tu es en retard !');
      }
    }

    if (gameId > 0) {
      const game: PlayGame = this.games.get(gameId);
      if (game) {
        game.users.push(user.id);
      } else {
        this.games.set(gameId, {
          game: user.playingAt.game,
          users: [user.id]
        } as PlayGame);
      }
      console.log(this.games)
      return {
        // not send ??
        success: true,
        gameid: gameId,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  async handleDisconnect(@ConnectedSocket() socket: SocketUserAuth) {
    const user = await this.getUserWithToken(socket);
    if (!this.clients.get(socket.id))
      return ;
    this.clients.delete(socket.id);
    if (user) {
      this.games.forEach((game, gameId) => {
        game.users.forEach((userId) => {
          if (userId === user.id) {
            console.log('disconnected of game ', gameId);
            game.users = game.users.filter((a) => a != userId)
            this.games.set(
              gameId,
              game,
            );
          }
        });
      });
      console.log(user.name + ' has left.');
    }
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

  @SubscribeMessage('ping')
  async ping(
    @MessageBody() data: pingpongData,
    @ConnectedSocket() socket: SocketUserAuth,
  ) {
    data.second = +new Date();
    return data;
  }

  @SubscribeMessage('pong')
  async pong(
    @MessageBody() data: pingpongData,
    @ConnectedSocket() socket: SocketUserAuth,
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
