import { BadRequestException, Injectable, Inject, forwardRef } from "@nestjs/common";
import { Invite, prisma } from "@prisma/client";
import { GameService } from "src/game/game.service";
import { ActionRedirContent, NotifService } from "src/notif/notif.service";
import { PrismaService } from "src/prisma.service";
import { UsersService } from "src/users/users.service";
import { GameSettingsInterface, InviteDTO } from "./invite.controller";

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

	private async areUsersAvail(inviteData: InviteDTO)
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
		const firstOnline = await this.usersService.getUserStatus(users[0]) === "online";
		const secondOnline = await this.usersService.getUserStatus(users[1]) === "online";

		return (notInMM && firstOnline && secondOnline);
	}

	private isGoodInviteSettings(settings: GameSettingsInterface)
	{
		return (
			settings.pointsToWin >= 3 && settings.pointsToWin <= 50
			&& settings.ballSpeed >= 5 && settings.ballSpeed <= 100
			&& (settings.timeLimit === undefined ||
				(settings.timeLimit >= 1 && settings.timeLimit <= 15))
		);
	}

	// TODO: Check for blocked user
	async sendInvite(inviteData: InviteDTO)
	{
		const usersAvail = await this.areUsersAvail(inviteData);
		if (!usersAvail) {
			throw new BadRequestException("Some invited users are busy");
		}
		if (!this.isGoodInviteSettings(inviteData.settings)) {
			throw new BadRequestException("Invites's settings are invalid");
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
		const canAccept = await this.areUsersAvail(inviteData);
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
