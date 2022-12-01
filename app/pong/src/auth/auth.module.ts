import { Module } from '@nestjs/common';
import { Api42Strategy } from './api42.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Module({ // TODO: https://docs.nestjs.com/security/authentication#implementing-passport-local
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
      signOptions: { expiresIn: '42 days' },
    }),
  ],
  providers: [PrismaService, AuthService, Api42Strategy, JwtStrategy, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}
