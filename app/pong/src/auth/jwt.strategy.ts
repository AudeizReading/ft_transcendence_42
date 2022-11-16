import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private UsersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // also: fromUrlQueryParameter http://www.passportjs.org/packages/passport-jwt/
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.UsersService.user({
      'login': payload.username
    });
    if (!user || user.sessionid != payload.sessionid) {
      throw new UnauthorizedException();
    }
    // TODO: Load all user info here?
    return {
      id: payload.sub,
      username: payload.username,
      sessionid: payload.sessionid,
      avatar: user.avatar
    };
  }
}
