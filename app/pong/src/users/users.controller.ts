import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt.authguard';

@Controller()
export class UsersController {
  constructor() {}

  @Get('user/info')
  @UseGuards(JwtAuthGuard)
  user_info(@Request() req) {
    console.log(req.user)
    return {
      connected: true,
      user: {
        avatar: req.user.avatar
      }
    };
  }
}