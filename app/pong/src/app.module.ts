import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';
import { NotifModule } from './notif/notif.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GameMatchMaking } from './game/game.matchmaking';

@Module({
  imports: [ConfigModule.forRoot({
    // isGlobal: true,  ????????
    envFilePath: ['.env'],
  }), ScheduleModule.forRoot(), GameMatchMaking, AuthModule, GameModule, UsersModule, NotifModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService],
})
export class AppModule {}
