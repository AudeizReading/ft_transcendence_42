import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { FriendModule } from './friend/friend.module';
import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';
import { NotifModule } from './notif/notif.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GameMatchMaking } from './game/game.matchmaking';
import { InviteModule } from './invite/invites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // isGlobal: true,  ????????
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    GameMatchMaking,
    AuthModule,
    GameModule,
    FriendModule,
    UsersModule,
    NotifModule,
    InviteModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService],
})
export class AppModule {}
