import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  getToken(login: string, sessionid: string) {
    const payload = { login: login, sessionid: sessionid };
  	return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET })
  }

  /*getUser() {
    return this.jwtService.decode()
  }*/
}
