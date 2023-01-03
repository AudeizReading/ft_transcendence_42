import {
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { FriendService } from '../friend/friend.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';

import { IsNumberString } from 'class-validator';

export class ParamId {
  @IsNumberString()
  id: number;
}

@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Get(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(@Request() req, @Param() param: ParamId) {

  }

  @Get(':id/refuse')
  @UseGuards(JwtAuthGuard)
  async refuse(@Request() req, @Param() param: ParamId) {

  }

  @Get(':id/retract')
  @UseGuards(JwtAuthGuard)
  async retract(@Request() req, @Param() param: ParamId) {

  }
}
