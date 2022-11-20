import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

// doc: https://blog.logrocket.com/social-logins-nestjs/

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {
  constructor(private UsersService: UsersService) {
    super({
      clientID: process.env.API_42_UID,
      clientSecret: process.env.API_42_SECRET,
      callbackURL: 'http://' + process.env.FRONT_HOST + ':8190/auth/callback',
      /* // TODO: Mettre le minimum?
      profileFields: {
        'id': function (obj) { return String(obj.id); },
        'username': 'login',
        'displayName': 'displayname',
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        'profileUrl': 'url',
        'emails.0.value': 'email',
        'phoneNumbers.0.value': 'phone',
        'photos.0.value': 'image_url'
      }
      */
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const user = await this.UsersService.user({
      'login': profile.username
    });
    const sessionid = crypto.randomBytes(32).toString('base64');
    if (!user)
    {
      console.log('create user');
      await this.UsersService.createUser({
        'email': profile.emails[0].value,
        'login': profile.username,
        'avatar': profile.photos[0].value,
        'sessionid': sessionid
      });
    }
    else
    {
      await this.UsersService.updateUser({
        where: {
          'login': profile.username
        },
        data: {
          'avatar': profile.photos[0].value,
          'sessionid': sessionid
        }
      })
    }
    // console.log(profile); // <<== toutes les infos ici :)
    return {
      'id': profile.id,
      'username': profile.username,
      'sessionid': sessionid,
      'api42': profile
    }
  }
}
