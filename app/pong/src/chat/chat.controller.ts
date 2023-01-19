import { Controller, Post, Get, Request, Delete, UseGuards, Param, Body, Put, ParseIntPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
	constructor(private chatService: ChatService,
				private chatGateway: ChatGateway) {}

	/*
		Get all channels for a specific user
	*/
	@Get('')
	@UseGuards(JwtAuthGuard)
	async getChannelsForUser(@Request() req) {
	  return this.chatService.fetchChannels(req.user.id);
	}

	@Get('all_joinable')
	@UseGuards(JwtAuthGuard)
	async getJoinableChannels(@Request() req) {
		return this.chatService.getJoinableChannels(req.user.id);
	}

	/* 
		Get messages for channel,
		can return 404, 401 and 200
	*/
	@Get('channel/:id')
	@UseGuards(JwtAuthGuard)
	async getChannelMessages(@Request() req, @Param('id') id: number) {
	  return this.chatService.getChannelMessages(id, req.user.id);
	}

	/*
		Create a channel
	*/
	@Post('channel/new')
	@UseGuards(JwtAuthGuard)
	async createNewChannel(@Request() req, @Body(new ValidationPipe({ transform: true })) createDto: CreateChannelDto)
	{
		return this.chatService.createChannel(createDto, req.user.id)
	}

	/*
		Delete a channel,
		can return 401 or OK when delete http
	*/
	@Delete('channel/:id')
	@UseGuards(JwtAuthGuard)
	async deleteChannel(@Request() req, @Param('id') id: number)
	{
		return this.chatService.deleteChannel(id, req.user.id);
	}

	/*
		Updates a channel,
			-> Add user
			-> Remove user
			-> Ban user
			-> Mute user
			-> Change password
			-> Add admin
			-> Remove admin
			-> Revoke ban
			-> Revoke mute
		can return 401 or OK
	*/
	@Put('channel/:id')
	@UseGuards(JwtAuthGuard)
	async updateChannel(@Request() req, @Param('id') id: number, @Body() updateDto: UpdateChannelDto)
	{
		return this.chatService.updateChannel(id, updateDto, req.user.id, this.chatGateway)
	}
	
	/*
		Get users that are addable to a channel.
	*/
	@Get('channel/:id/addable_users')
	@UseGuards(JwtAuthGuard)
	async getAddableUsers(@Request() req, @Param('id', ParseIntPipe) id: number)
	{
		return this.chatService.getAddableUsers(id, req.user.id);
	}


	/*
		Leaves a channel.
	*/
	@Post('channel/:id/leave')
	@UseGuards(JwtAuthGuard)
	async leaveChannel(@Request() req, @Param('id', ParseIntPipe) id: number)
	{
		return this.chatService.leaveChannel(id, req.user.id);
	}

	/*
		Joins a channel.
	*/
	@Post('channel/:id/join')
	@UseGuards(JwtAuthGuard)
	async joinChannel(@Request() req, @Param('id', ParseIntPipe) id: number, @Body('password', new ValidationPipe({ transform: true })) password: string)
	{
		return this.chatService.joinChannel(id, password, req.user.id);
	}

}
