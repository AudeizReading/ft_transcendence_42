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
import { InviteModule } from './invite/invite.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // isGlobal: true,  ????????
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    NotifModule,
    UsersModule,
    AuthModule,
    GameModule,
    FriendModule,
    InviteModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
