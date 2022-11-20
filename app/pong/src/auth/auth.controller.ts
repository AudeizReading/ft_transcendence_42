import { Controller, Get, Request, Query, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { encode } from 'html-entities';
import { Api42AuthGuard } from './api42.authguard';
import { JwtAuthGuard } from './jwt.authguard';
import { UsersService } from '../users/users.service';

// doc: https://blog.logrocket.com/social-logins-nestjs/

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private UsersService: UsersService) {}

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
        + '#bearer=${this.authService.getToken(user.id, user.login, user.sessionid)}';
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
    await this.UsersService.updateUser({
      where: {
        'login': req.user.login
      },
      data: {
        'sessionid': ''
      }
    })
  }
}
