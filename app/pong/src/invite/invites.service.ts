import { Injectable } from "@nestjs/common";
import { NotifService } from "src/notif/notif.service";
import { UsersService } from "src/users/users.service";
import { SendInviteDTO } from "./invites.controller";

@Injectable()
export class InviteService
{
	constructor(
		private usersService: UsersService,
		private notifService: NotifService,
	) {}

	async sendInvite(inviteData: SendInviteDTO)
	{
		console.log("Service: ", inviteData);
		console.log("Service, settings: ", inviteData.settings);
	}
}
