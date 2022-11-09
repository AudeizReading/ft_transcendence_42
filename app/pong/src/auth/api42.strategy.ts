import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';

// doc: https://blog.logrocket.com/social-logins-nestjs/

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {
  constructor() {
    super({
      clientID: process.env.API_42_UID,
      clientSecret: process.env.API_42_SECRET,
      callbackURL: 'http://127.0.0.1:8190/auth/callback',
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
    console.log('TODO: Save data with prisma (= database)');
    // console.log(profile); // <<== toutes les infos ici :)
    return profile;
  }
}
