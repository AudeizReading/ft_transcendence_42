import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // also: fromUrlQueryParameter http://www.passportjs.org/packages/passport-jwt/
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.user({
      'login': payload.login
    });
    if (!user || user.sessionid != payload.sessionid) {
      throw new UnauthorizedException('Invalid payload');
    }
    // You can add user data in `req.user` for the controller
    return {
      id: user.id,
      login: payload.login,
      name: user.name,
      sessionid: payload.sessionid,
      sub: payload.sub,
      avatar: user.avatar,
      mMaking: (user as any).mMaking, // Ca me fait légérement rire ce hack (et le ts, se veux mieux que le js ? LOL)
      isPlaying: false // TODO: Is playing
    };
  }
}
