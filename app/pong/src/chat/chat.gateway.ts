import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
  } from '@nestjs/websockets';
  import { ChatService } from './chat.service';
import { Injectable, UseGuards, ValidationPipe } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { fromAuthHeaderOAsBearerToken } from '../auth/jwt.strategy';
import { prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { User, ChatChannel, ChatMessage } from '@prisma/client';
import { SendMessageDto } from './dto/send-message.dto';

type SocketUserAuth = Socket & {
	user: User;
  }; 

interface ChatClient {
	userId: number;
	channelIds: number[];
	socketId: string;
};


@Injectable()
@WebSocketGateway(8192, {
  namespace: 'chat',
  cors: {
    origin: '*',
    maxAge: 600,
  },
})
export class ChatGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
	private readonly chatService: ChatService,
	private prismaService: PrismaService,
	private jwtService: JwtService,
	private jwtStrategy: JwtStrategy)
	{}

	private clients: Map<string, ChatClient> = new Map();

	@WebSocketServer()
	private server: Server;

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

	async handleConnection(socket: Socket)
	{
		const user = await this.getUserWithToken(socket);
		if (!user) {
			socket.disconnect();
			return false;
		}
		const iterator1 = this.clients[Symbol.iterator]();

		for (const item of iterator1) {
			if (item[1].userId === user.id) {
				console.log('double connexion!');
				socket.disconnect();
				return false;
			}
		}
		console.log(user.name, 'has joined the chats.');

		const client: ChatClient = {
			userId: user.id,
			channelIds: await this.chatService.getChannelsIds(user.id),
			socketId: socket.id,
		};
		this.clients.set(client.socketId, client);
	}

	@UseGuards(JwtAuthGuard)
	async handleDisconnect(@ConnectedSocket() socket: SocketUserAuth)
	{
	  const user = await this.getUserWithToken(socket);
	  if (!this.clients.get(socket.id)) return;
	  this.clients.delete(socket.id);
	}	

	getSocketIdByUserId(id: number)
	{
		for (const e of this.clients[Symbol.iterator]()) {
			if (e[1].userId === id)
				return e[1].socketId;
		}
		return null;
	}
	// Methods that updates the client but is triggered by the backend, after all SQL is done 
	async onChannelAdd(user_id: number, channel_id: number)
	{
		const sockId = this.getSocketIdByUserId(user_id)
		if (!sockId)
			return ;
		this.server.to(sockId).emit('channel_add', channel_id);
	}
	async onChannelRemove(user_id: number, channel_id: number)
	{
		const sockId = this.getSocketIdByUserId(user_id)
		if (!sockId)
			return ;
		this.server.to(sockId).emit('channel_remove', channel_id);
	}
	async onChannelMute(user_id: number, channel_id: number)
	{
		const sockId = this.getSocketIdByUserId(user_id)
		if (!sockId)
			return ;
		this.server.to(sockId).emit('channel_mute', channel_id);
	}
	async onChannelUnmute(user_id: number, channel_id: number)
	{
		const sockId = this.getSocketIdByUserId(user_id)
		if (!sockId)
			return ;
		this.server.to(sockId).emit('channel_unmute', channel_id);
	}
	async onChannelPromote(user_id: number, channel_id: number)
	{
		const sockId = this.getSocketIdByUserId(user_id)
		if (!sockId)
			return ;
		this.server.to(sockId).emit('channel_promote', channel_id);
	}
	async onChannelDemote(user_id: number, channel_id: number)
	{
		const sockId = this.getSocketIdByUserId(user_id)
		if (!sockId)
			return ;
		this.server.to(sockId).emit('channel_demote', channel_id);
	}

	@SubscribeMessage('send_message')
	@UseGuards(JwtAuthGuard)
	async send_message(
		@ConnectedSocket() socket: SocketUserAuth,
		@MessageBody(new ValidationPipe({ transform: true })) messageDto: SendMessageDto)
	{
		// Trying to send to a channel the user is not part of
		if (!this.clients.get(socket.id).channelIds.includes(messageDto.channel))
			return ;

		// Put message in database
		const message = await this.chatService.sendMessage(socket.user.id, messageDto.channel, messageDto.content);
		if (!message)
			return ;

		// Tell every connected socket to receive that message
		for (const e of this.clients[Symbol.iterator]()) {
		  if (e[1].channelIds.includes(messageDto.channel))
		  	this.server.to(e[1].socketId).emit('recv_msg', message);
		}
	
	}
}
