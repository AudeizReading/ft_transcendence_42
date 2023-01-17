import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { ChannelType, ChannelUserPower, Prisma } from '@prisma/client';

import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto, UpdateChannelOperator } from './dto/update-channel.dto';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService)
  {}

  //TODO: Sanitize input so it doesnt have XSS
  async sendMessage(id: number, channel: number, content: string) {
	const user = await this.prisma.channelUser.findUnique({where: {userId_channelId: {userId: id, channelId: channel}}});
	if (user.ban_expiration || user.mute_expiration)
		return null;
	try
	{
		return await this.prisma.chatMessage.create({
			data: {
				senderId: id,
				channelId: channel,
				content: content
			}
		})
	} catch (e)
	{ return null; }
  }


  async joinChannel(channel_id: number, password: string, user_id: number) {
	  const channel = await this.prisma.chatChannel.findFirst({
			where: {
				OR: [
					{
						id: channel_id,
						password: password,
						visibility: ChannelType.PASSWORD_PROTECTED
					},
					{
						id: channel_id,
						password: password,
						visibility: ChannelType.PUBLIC
					},
				],
				NOT: {
					users: {
						some: {
							userId: user_id
						}
					}
				}
			}
		})
		if (!channel)
			throw new HttpException("Channel could not be joined", HttpStatus.I_AM_A_TEAPOT)
		return await this.prisma.channelUser.create({
			data: {
				channelId: channel_id,
				userId: user_id,
				power: ChannelUserPower.REGULAR
			}
		});
  }

	async createChannel(createDto: CreateChannelDto, user_id: number) {
		/*           VVVVVVVVVVVVVVVVVVVVVVVVVVVV <-- LOL */
		const data = [...new Set(createDto.users)].map(obj => ({userId: obj, power: ChannelUserPower.REGULAR}))

		if (createDto.visibility == ChannelType.PRIVATE_MESSAGE
			&& (createDto.users.length > 2))
		{
			throw new HttpException("Private message channel with more than two users?", HttpStatus.I_AM_A_TEAPOT);
		}
		else if (createDto.visibility == ChannelType.PRIVATE_MESSAGE)
		{
			try
			{
				return await this.prisma.chatChannel.create({
					data: {
						name: "<DM>",
						visibility: createDto.visibility,
						password: null,
						users: {
							create: [
								{userId: user_id, power: ChannelUserPower.REGULAR},
								...(data)
							]
						}
					}
				})
			} catch (e)
			{
				throw new HttpException("This private message channel already exists, handmade requests again?", HttpStatus.I_AM_A_TEAPOT);
			}
		}
		if (!data.length)
			throw new HttpException('Can not create a channel with yourself only', HttpStatus.I_AM_A_TEAPOT);
		try {
				return await this.prisma.chatChannel.create({
					data: {
						name: createDto.name,
						visibility: createDto.visibility,
						password: createDto.password,
						users: {
							create: [
								{userId: user_id, power: ChannelUserPower.OWNER},
								...(data)
							]
						}
					}
				})
			} catch (e)
			{
				if (e instanceof Prisma.PrismaClientKnownRequestError)
				{
					if (e.code == "P2002")
						throw new HttpException('Channel name is not unique', HttpStatus.I_AM_A_TEAPOT);
					else if (e.code == "P2003")
						throw new HttpException('Unknown user was added. Handmade request?', HttpStatus.I_AM_A_TEAPOT);
					else
						throw new HttpException("Unknown internal error on channel creation", HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
  }

  async leaveChannel(channel_id: number, user_id: number) {
		try
		{
			// Make sure user can leave the channel
			await this.prisma.chatChannel.findFirstOrThrow({
				where: {
					id: channel_id,
					visibility: {
						not: ChannelType.PRIVATE_MESSAGE
					},
					users: {
						some: {
							AND: [
								{
									userId: user_id,
									ban_expiration: null
								},
								{
									userId: user_id,
									mute_expiration: null
								}
							]
						}
					}
				}
			})

			// Delete user
			const user = await this.prisma.channelUser.delete({
				where: {
					userId_channelId: {userId: user_id, channelId: channel_id}
				}
			})

			/* If user who left was owner */
			if (user.power == ChannelUserPower.OWNER)
			{
				// Find another user to give ownership to
				const new_owner = await this.prisma.channelUser.findFirst({
					where: {
						channelId: channel_id,
					}
				});
				if (new_owner) // There is another user
				{
					await this.prisma.channelUser.update({
						where: {
							userId_channelId: {userId: new_owner.userId, channelId: new_owner.channelId}
						},
						data: {
							power: ChannelUserPower.OWNER
						}
					})
				}
				else // No other user -> delete channel
				{
					return await this.prisma.chatChannel.delete({
						where: {
							id: channel_id
						}
					})
				}
			}
		}
		catch (e)
		{
			throw new HttpException("Channel could not be left", HttpStatus.I_AM_A_TEAPOT)
		}
  }

	//TODO: turn ban and mute into two dates instead of a permission
  async updateChannel(channel_id: number, updateDto: UpdateChannelDto, user_id: number, gateway: ChatGateway) {
		// Get channel that needs to be updated
		try
		{
			// Get the user performing the action
			const user = await this.prisma.channelUser.findFirstOrThrow({
				where: {
					userId: user_id,
					channelId: channel_id
				}
			})
			const channel = await this.prisma.chatChannel.findFirstOrThrow({
				where: {
					id: channel_id,
					visibility: {
						not: ChannelType.PRIVATE_MESSAGE
					}
				}
			})

			// Permission check on the user trying to perform a modification on the channel
			if (user.power != ChannelUserPower.OWNER
			&& ( (user.power == ChannelUserPower.REGULAR
						&& updateDto.operation != UpdateChannelOperator.ADD_USER)
				|| (user.power == ChannelUserPower.ADMINISTRATOR
						&& (updateDto.operation != UpdateChannelOperator.CHANGE_PASSWORD 
						&& updateDto.operation != UpdateChannelOperator.ADD_ADMIN
						&& updateDto.operation != UpdateChannelOperator.REMOVE_ADMIN))
					)
				)
			{
				throw new HttpException("Not enough power to do this", HttpStatus.FORBIDDEN);
			}

			try {
				switch (updateDto.operation) {
					case UpdateChannelOperator.ADD_USER:
						this.prisma.channelUser.create({data: {channelId: channel_id, userId: updateDto.parameter, power: ChannelUserPower.REGULAR}})
						await gateway.onChannelAdd(updateDto.parameter, channel_id)
						break;
					case UpdateChannelOperator.REMOVE_USER:
						if (user.id != updateDto.parameter)
						{
							if (user.power != ChannelUserPower.OWNER)
								this.prisma.channelUser.deleteMany({where: {channelId: channel_id, userId: updateDto.parameter, power: ChannelUserPower.REGULAR}})
							else
								this.prisma.channelUser.deleteMany({where: {channelId: channel_id, userId: updateDto.parameter}})
							await gateway.onChannelRemove(updateDto.parameter, channel_id)
						}
						break;
					case UpdateChannelOperator.BAN_USER:
						if (user.id != updateDto.parameter)
						{
							if (user.power != ChannelUserPower.OWNER)
								this.prisma.channelUser.updateMany({where: {channelId: channel_id, userId: updateDto.parameter, power: ChannelUserPower.REGULAR}, data: {ban_expiration: updateDto.parameter_2}})
							else
								this.prisma.channelUser.updateMany({where: {channelId: channel_id, userId: updateDto.parameter}, data: {ban_expiration: updateDto.parameter_2}})
							await gateway.onChannelRemove(updateDto.parameter, channel_id)
						}
						break;
					case UpdateChannelOperator.MUTE_USER:
						if (user.id != updateDto.parameter)
						{
							if (user.power != ChannelUserPower.OWNER)
								this.prisma.channelUser.updateMany({where: {channelId: channel_id, userId: updateDto.parameter, power: ChannelUserPower.REGULAR}, data: {mute_expiration: updateDto.parameter_2}})
							else
								this.prisma.channelUser.updateMany({where: {channelId: channel_id, userId: updateDto.parameter}, data: {mute_expiration: updateDto.parameter_2}})
							await gateway.onChannelMute(updateDto.parameter, channel_id)
						}
						break;
					//TODO: Hash password
					case UpdateChannelOperator.CHANGE_PASSWORD:
						if (!updateDto.parameter)
							this.prisma.chatChannel.update({where: {id: channel_id}, data: {password: null, visibility: ChannelType.PUBLIC}})
						else
						{
							this.prisma.chatChannel.update({where: {id: channel_id}, data: {password: updateDto.parameter, visibility: ChannelType.PASSWORD_PROTECTED}})
							this.prisma.channelUser.deleteMany({where: {channelId: channel_id, power: ChannelUserPower.REGULAR}})
						}
						break;
					case UpdateChannelOperator.ADD_ADMIN:
						this.prisma.channelUser.update({where: {userId_channelId: {userId: updateDto.parameter, channelId: channel_id}}, data: {power: ChannelUserPower.ADMINISTRATOR}})
						await gateway.onChannelDemote(updateDto.parameter, channel_id)
						break;
					case UpdateChannelOperator.REMOVE_ADMIN:
						this.prisma.channelUser.update({where: {userId_channelId: {userId: updateDto.parameter, channelId: channel_id}}, data: {power: ChannelUserPower.REGULAR}})
						await gateway.onChannelPromote(updateDto.parameter, channel_id)
						break;
					case UpdateChannelOperator.REVOKE_BAN:
						if (updateDto.parameter != user.id)
						{
							this.prisma.channelUser.update({where: {userId_channelId: {userId: updateDto.parameter, channelId: channel_id}}, data: {power: ChannelUserPower.REGULAR, ban_expiration: null}})
							await gateway.onChannelAdd(updateDto.parameter, channel_id)
						}
						break;
					case UpdateChannelOperator.REVOKE_MUTE:
						if (updateDto.parameter != user.id)
						{
							this.prisma.channelUser.update({where: {userId_channelId: {userId: updateDto.parameter, channelId: channel_id}}, data: {mute_expiration: null}})
							await gateway.onChannelUnmute(updateDto.parameter, channel_id)
						}
						break;
				}
			} catch (e) { throw new HttpException("Error performing this action", HttpStatus.I_AM_A_TEAPOT); }
		} catch (e) { throw new HttpException("No such channel", HttpStatus.I_AM_A_TEAPOT); }
  }

  async deleteChannel(channel_id: number, user_id: number) {
		const user = await this.prisma.channelUser.findFirstOrThrow({
			where: {
				userId: user_id,
				channelId: channel_id
			}
		})
		if (user.power != ChannelUserPower.OWNER)
			throw new HttpException("Privilege level too low to delete channel", HttpStatus.FORBIDDEN);

		try
		{
			return await this.prisma.chatChannel.delete({
				where: {
					id: channel_id
				}
			})
		} catch (e) {
			throw new HttpException("No such channel", HttpStatus.I_AM_A_TEAPOT)
		}
  }

	// Check if sender is properly fetched
  async getChannelMessages(channel_id: number, user_id: number) {
	  const user = await this.prisma.channelUser.findUnique({where: {userId_channelId: {userId: user_id, channelId: channel_id}}})
	  if (!user)
	  	throw new HttpException("No such channel or you are not part of it", HttpStatus.I_AM_A_TEAPOT);
	  if (user.ban_expiration)
	  	throw new HttpException("You are banned from this channel", HttpStatus.FORBIDDEN);
	  return await this.prisma.chatMessage.findMany({
			where: {
				channelId: channel_id
			},
			select: {
				sender: true,
				content: true,
				sent_at: true
			}
		})
 	 }

  async getChannelsIds(user_id: number) {
	const ids = await this.prisma.chatChannel.findMany({
		where: {
			users: {
				some: {
					userId: user_id,
					ban_expiration: null
				}
			}
		},
		select: {
			id: true,
		}
	})
	return (ids.map(obj => obj.id));
  }

  async fetchChannels(user_id: number) {
	  return await this.prisma.chatChannel.findMany({
			where: {
				users: {
					some: {
						userId: user_id,
						ban_expiration: null
					}
				}
			},
			select: {
				name: true,
				messages: true,
				users: {
					select: {
						user: {
							select: {
								id: true,
								name: true
							}
						}
					}
				},
				visibility: true
			}
		})
  }
}
