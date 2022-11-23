import { Module } from '@nestjs/common';
import { Api42Strategy } from './api42.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({ // TODO: https://docs.nestjs.com/security/authentication#implementing-passport-local
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
      signOptions: { expiresIn: '42 days' },
    }),
  ],
  providers: [AuthService, Api42Strategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
