import { Controller, Get, Request, Query, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { encode } from 'html-entities';
import { Api42AuthGuard } from './api42.authguard';
import { JwtAuthGuard } from './jwt.authguard';
import { UsersService } from '../users/users.service';

import { Param } from '@nestjs/common';
import { IsNumberString, IsString, IsAlpha } from 'class-validator';
import * as crypto from 'crypto';

// doc: https://blog.logrocket.com/social-logins-nestjs/

export class ParamLogin {
  @IsAlpha()
  login: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private usersService: UsersService) {}

  /*@Get('callback')
  @HttpCode(401)
  async authCallback_error(@Request() req,
    @Query('error') error: string,
    @Query('error_description') error_description: string) {
    return `<h1>${encode(error)}</h1><p>${encode(error_description)}</p>
      <p style=text-align:right;>This windows will close in 10sec</p>
      <script>setTimeout(() => window.close(), 10000);</script>`;
  }*/

  @Get('callback')
  @UseGuards(Api42AuthGuard)
  async authCallback(@Request() req) {
    console.log('You are the king'); // TODO: Remove this line
    const user = req.user;
    return `<script>
      location = 'http://' + window.location.hostname + ':3000/auth'
        + '#bearer=${this.authService.getToken(user.login, user.sessionid)}';
    </script>`;
  }

  @Get('fake/:login') // TODO: Not in eval?
  async fakeLogin(@Request() req, @Param() param: ParamLogin) {
    let user = await this.usersService.user({
      'login': param.login
    });
    const sessionid = crypto.randomBytes(32).toString('base64');
    if (!user)
    {
      console.log('create user');
      await this.usersService.createUser({
        'email': param.login + '@fake348004549.fr',
        'login': param.login,
        'name': param.login,
        'avatar': 'https://i.pinimg.com/originals/f1/20/6e/f1206eb6d699e0e76f61f91e240b100d.jpg',
        'sessionid': sessionid
      });
    }
    else
    {
      const refresh_av = user.avatar && user.avatar.indexOf('http') === 0;

      await this.usersService.updateUser({
        where: {
          'login': param.login
        },
        data: {
          'sessionid': sessionid
        }
      })
    }
    user = await this.usersService.user({
      'login': param.login
    });
    console.log('You are a fake king');
    return `<script>
      location = 'http://' + window.location.hostname + ':3000/auth'
        + '#bearer=${this.authService.getToken(param.login, sessionid)}';
    </script>`;
  }

  @Get()
  @UseGuards(Api42AuthGuard)
  async login() {
    /* enable http://localhost/auth/ */
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    await this.usersService.updateUser({
      where: {
        'login': req.user.login
      },
      data: {
        'sessionid': ''
      }
    })
  }
}
