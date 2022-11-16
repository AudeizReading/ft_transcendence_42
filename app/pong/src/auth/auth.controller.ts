import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

// doc: https://blog.logrocket.com/social-logins-nestjs/

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Get('callback')
  @UseGuards(AuthGuard('api42'))
  async authCallback(@Request() req) {
    const user = req.user;
    const payload = { sub: user.id, username: user.username };
    console.log('You are the king'); // TODO: Remove this line
    return {
      accessToken: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET })
    };
  }

  @Get()
  @UseGuards(AuthGuard('api42'))
  async login() { }

  @Get('hello')
  @UseGuards(AuthGuard('jwt'))
  hello(): string {
    return 'Ok';
  }
}
