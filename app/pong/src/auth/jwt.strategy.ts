import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: customExtractorFromAuthHeaderAsBearerToken,
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // also: fromUrlQueryParameter http://www.passportjs.org/packages/passport-jwt/
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
      isPlaying: (user as any).games.length != 0,
      currentgames: (user as any).games
    };
  }
}

function parseAuthHeader(hdrValue) { // src: 'passport-jwt/lib/auth_header.js'
    if (typeof hdrValue !== 'string') {
        return null;
    }
    const matches = hdrValue.match(/(\S+)\s+(\S+)/);
    return matches && { scheme: matches[1], value: matches[2] };
}

// Inspired by: https://github.com/mikenicholson/passport-jwt/blob/96a6e5565ba5a6f3301d91959a0f646e54446388/lib/extract_jwt.js#L55
function customExtractorFromAuthHeaderAsBearerToken(request: any) { // any => HTTP or websocket
  let token = null;
  const bool = (request.headers && request.headers['authorization']);
  if (bool || (request.handshake && request.handshake?.headers['authorization'])) {
    const headers = (bool) ? request.headers : request.handshake.headers;
    const auth_params = parseAuthHeader(headers['authorization']);
    if (auth_params && 'bearer' === auth_params.scheme.toLowerCase()) {
        token = auth_params.value;
    }
  }
  return token;
}
