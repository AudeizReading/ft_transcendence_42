import { Controller, Post, Get, Request, UseGuards, Param } from '@nestjs/common';
import { NotifService } from '../notif/notif.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';

import { IsNumberString } from 'class-validator';

export class ParamId {
  @IsNumberString()
  id: number;
}

@Controller('notif')
export class NotifController {
  constructor(private notifService: NotifService) {}

  @Get('fake/:id')
  async make_fake_notif(@Param() param: ParamId) {
    this.notifService.createNotif(Number(param.id), {
      text: 'Vous avez demander une fake notif la voici. '
      + 'Pour être un peu plus utile, si vous cliquez sur moi vous allez '
      + 'être redirigé sur votre profil.',
      url: '/user/' + Number(param.id)
    });
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async delete_notif(@Request() req) {

  }
}
