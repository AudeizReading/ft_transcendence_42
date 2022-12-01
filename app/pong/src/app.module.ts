import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotifModule } from './notif/notif.module';
import { GameService } from './game/game.service';
import { GameController } from './game/game.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot({
    // isGlobal: true,  ????????
    envFilePath: ['.env'],
  }), ScheduleModule.forRoot(), AuthModule, UsersModule, NotifModule],
  controllers: [AppController, GameController],
  providers: [AppService, PrismaService, JwtService, AuthService, GameService],
})
export class AppModule {}
