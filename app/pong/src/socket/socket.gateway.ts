import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Socket, Server } from 'socket.io';
import { fromAuthHeaderOAsBearerToken } from '../auth/jwt.strategy';

interface Client {
  userId: number;
  socketId: string;
};

type SocketUserAuth = Socket & {
  user: Object;
};

// https://docs.nestjs.com/websockets/gateways
// https://codesandbox.io/s/xingyibiaochatserver-6x1jc?file=/src/main.ts

@WebSocketGateway(8192, {
  cors: {
    origin: '*',
    maxAge: 600
  }
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService,
              private jwtStrategy: JwtStrategy) {}

  @WebSocketServer()
  private server: Server;

  private clients: Map<string, Client> = new Map();

  // @UseGuards(JwtAuthGuard) <== Not supported for handleConnection
  async handleConnection(socket: SocketUserAuth) {
    const token = fromAuthHeaderOAsBearerToken(socket);
    const user = await (async () => {
      try {
        return this.jwtStrategy.validate(await this.jwtService.verify(token, { secret: process.env.JWT_SECRET }));
      } catch (e) {
        if (e.name !== 'JsonWebTokenError')
          console.error(e); // show other error
        return (null);
      }
    })();
    console.log('connection', socket.id);
    if (!user) {// && demo) ??? ---> pouvoir laisser voir la demo aux hors-lignes
      socket.disconnect();
      return { success: false, gameid: -1 };
    }

    const client: Client = {
      userId: user.id,
      socketId: socket.id
    };
    this.clients.set(client.socketId, client);

    console.log('👇️ total:', this.clients.size);
    this.clients.forEach((client, id) => {
      console.log(id, client);
    });

    if (socket.handshake?.query?.gameid == 'mygame' && user.playingAt) {
      return {
        success: true,
        gameid: user.playingAt.gameid
      }
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnection', socket.id);
    this.clients.delete(socket.id);
    /*this.roomMap.forEach((room, key) => {
      room.forEach((user, i) => {
        if (user.sessionId === socket.id) {
          const users = this.roomMap.get(key);
          this.roomMap.set(key, users.splice(i, 1));
          console.log(this.roomMap);
        }
      });
    });*/
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

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('login')
  handleLogin(@MessageBody() data: string, @ConnectedSocket() socket: SocketUserAuth) {
    //console.log(socket.user);
    return { success: true };
  }

  /*@SubscribeMessage('login')
  handlerLogin(
    socket: Socket,
    payload: any,
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
