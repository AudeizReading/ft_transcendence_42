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

  @Get(':id/accept')
  @UseGuards(JwtAuthGuard)
  async accept(@Request() req, @Param() param: ParamId) {
    this.friendService.acceptFriendRequest(param.id, req.user.id);
  }

  @Get(':id/refuse')
  @UseGuards(JwtAuthGuard)
  async refuse(@Request() req, @Param() param: ParamId) {
    this.friendService.deleteFriendship(param.id, req.user.id);
  }
  
  @Get(':id/remove')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param() param: ParamId) {
    this.friendService.deleteFriendship(param.id, req.user.id);
  }
}
