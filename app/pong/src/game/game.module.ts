import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { GameController } from './game.controller';
import { UsersService } from '../users/users.service';
import { NotifService } from '../notif/notif.service';
import { GameSocketGateway } from '../game/game.socket.gateway';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  providers: [
    GameService,
    GameSocketGateway,
    PrismaService,
    NotifService,
    UsersService,
    JwtService,
    JwtStrategy,
  ],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
