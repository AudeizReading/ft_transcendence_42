import {
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
  Param,
	Body,
	BadRequestException,
	Req,
	HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.authguard';
import { InviteService } from './invites.service';

export class GameSettingsInterface {
	pointsToWin: number;
	ballSpeed: number;
	timeLimit: number | undefined;
}

export class InviteDTO {
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

	// TODO: have good error handling, bruv
	// TODO: More guards?
	@Post('send')
	@UseGuards(JwtAuthGuard)
	async send(@Req() req, @Body() invite: InviteDTO)
	{
		if (invite.toID === req.user.id) {
			console.log("Cannot invite self");
			throw new BadRequestException("Cannot invite self");
		}
		return this.inviteService.sendInvite(invite);
	}

	@Post('delete')
	@UseGuards(JwtAuthGuard)
	async delete(@Body() invite: InviteDTO)
	{
		console.log("Deleting invite");
		return this.inviteService.sendInvite(invite);
	}
}
