import {
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
  Param,
	Body,
	BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { InviteService } from './invites.service';

export class GameSettingsInterface {
	pointsToWin: number;
	ballSpeed: number;
	timeLimit: number | undefined;
}

export class SendInviteDTO {
	fromID: number;
	toID: number;
	settings: GameSettingsInterface;
}

@Controller('invite')
export class InviteController
{
	constructor(
		private inviteService: InviteService,
	) {}

	@Post('send')
	@UseGuards(JwtAuthGuard)
	async send(@Body() invite: SendInviteDTO)
	{
		console.log("In controller: ", invite);
		this.inviteService.sendInvite(invite);
		return invite;
	}
}
