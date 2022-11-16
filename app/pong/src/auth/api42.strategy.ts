import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';
import { UsersService } from '../users/users.service';

// doc: https://blog.logrocket.com/social-logins-nestjs/

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy, 'api42') {
  constructor(private UsersService: UsersService) {
    super({
      clientID: process.env.API_42_UID,
      clientSecret: process.env.API_42_SECRET,
      callbackURL: 'http://192.168.13.128:8190/auth/callback',
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
    console.log(profile); 
    const user = await this.UsersService.user({
      'email': profile.emails[0].value
    });
    if (!user)
    {
      await this.UsersService.createUser({
        'email': profile.emails[0].value,
        'login': profile.username
      });
    } else {
      console.log('found');
    }
    // console.log(profile); // <<== toutes les infos ici :)
    return profile;
  }
}
