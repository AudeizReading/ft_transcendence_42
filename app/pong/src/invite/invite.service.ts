import { BadRequestException, Injectable, Inject, forwardRef } from "@nestjs/common";
import { Invite, prisma } from "@prisma/client";
import { GameService } from "src/game/game.service";
import { ActionRedirContent, NotifService } from "src/notif/notif.service";
import { PrismaService } from "src/prisma.service";
import { UsersService } from "src/users/users.service";
import { InviteDTO } from "./invite.controller";

@Injectable()
export class InviteService
{
	constructor(
		private prisma: PrismaService,
		private usersService: UsersService,
    	@Inject(forwardRef(() => NotifService))
		private notifService: NotifService,
		private gameService: GameService,
	) {}

	async isInvitePossible(inviteData: InviteDTO)
	{
		const users = await this.prisma.user.findMany({
			where: {
				OR: [
					{id: inviteData.fromID},
					{id: inviteData.toID},
				],
			},
			include: {
				mMaking: true,
			}
		});
		if (!users) // NOTE: No idea if this is necessary.
			return false;

		const notInMM = users.every(user => !user.mMaking || user.mMaking.userId !== user.id);
		const areOnline = users.every(async (user) =>
			await this.usersService.getUserStatus(user) === "online");

		return (notInMM && areOnline);
	}

	// TODO: Check for blocked user
	async sendInvite(inviteData: InviteDTO)
	{
		const canInvite = await this.isInvitePossible(inviteData);
		if (!canInvite) {
			throw new BadRequestException("Some invited users are busy");
		}

		const newInvite = await this.prisma.invite.create({
			data: {
				fromID: inviteData.fromID,
				toID: inviteData.toID,
				settings: JSON.stringify(inviteData.settings),
			},
			include: {
				from: true
			}
		});

		// Put serialized JSON in the notif text. Frontend decodes it.
		const notifMetadata = {
			text: `${newInvite.from.name} vous invite à jouer à Pong !`,
			invite: { ...inviteData },
		};
		await this.notifService.createNotif(inviteData.toID, {
			text: JSON.stringify(notifMetadata),
			url: `/${newInvite.fromID}`,
			type: "GAMEINVITE",
		});
		delete newInvite.from; // Remove that 'from' field we included.
		return newInvite as Invite;
	}

	async deleteInvite(invite: InviteDTO)
	{
		const deletedInvite = await this.prisma.invite.delete({
			where: {
				fromID_toID_settings: {
					fromID: invite.fromID,
					toID: invite.toID,
					settings: JSON.stringify(invite.settings),
				}
			}
		});
		return deletedInvite;
	}

	async acceptInvite(inviteData: InviteDTO)
	{
		const canAccept = await this.isInvitePossible(inviteData);
		if (!canAccept)
			throw new BadRequestException("Cannot accept invite");
		console.log("DATA: ", inviteData);
		const newGame = await this.gameService.createGame(inviteData.fromID, inviteData.toID, inviteData);
		const deleted = await this.prisma.invite.deleteMany({
			where: {
				OR: [
					{fromID: inviteData.fromID, toID: inviteData.toID},
					{fromID: inviteData.toID, toID: inviteData.fromID},
				]
			}
		});
		const redirAction: ActionRedirContent = {
			type: 'redir',
			url: '/game/',
		};
		await this.notifService.createAction(inviteData.fromID, redirAction);
		await this.notifService.createAction(inviteData.toID, redirAction);
	}

	async deleteAllExpired()
	{
		const res = await this.prisma.invite.deleteMany({
			where: {
				createdAt: {
					lt: new Date(Date.now() - 1000 * 60 * 2)
				}
			}
		});
		return res.count;
	}
}
