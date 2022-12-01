import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { GameController } from './game.controller';
import { NotifService } from '../notif/notif.service';

@Module({
  providers: [GameService, PrismaService, NotifService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
