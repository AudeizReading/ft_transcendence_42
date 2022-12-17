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
import { Socket, Server } from 'socket.io';

type UserInfo = {
  sessionId: string;
  userName: string;
  roomName: string;
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
  @WebSocketServer()
  private server: Server;

  private roomMap: Map<string, UserInfo[]> = new Map();

  @UseGuards(JwtAuthGuard)
  handleConnection(client: Socket) {
    console.log('connection', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('disconnection', client.id);
    /*this.roomMap.forEach((room, key) => {
      room.forEach((user, i) => {
        if (user.sessionId === client.id) {
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
  handleLogin(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    return { success: true };
  }

  /*@SubscribeMessage('login')
  handlerLogin(
    client: Socket,
    payload: any,
  )/*: { success: boolean; isPublisher?: boolean }* / {
    console.log('??')
    /*const [userName, roomName] = payload;
    try {
      client.join(roomName);
      const sessionId = client.id;
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
  handlerChat(client: Socket, msg: string) {
    const { sender, roomName } = this.getUserInfoBySId(client.id);

    if (!sender) return;
    client.to(roomName).emit('chat', msg);
    return msg;
  }*/
}
