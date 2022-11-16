import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  getToken(id: number, username: string, sessionid: string) {
    const payload = { sub: id, username: username, sessionid: sessionid };
  	return this.jwtService.sign(payload, { secret: process.env.JWT_SECRET })
  }

  /*getUser() {
    return this.jwtService.decode()
  }*/
}
