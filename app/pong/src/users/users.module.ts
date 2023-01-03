import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersController } from './users.controller';
import { NotifService } from '../notif/notif.service';
import { FriendService } from '../friend/friend.service';
import { GameService } from '../game/game.service';

@Module({
  providers: [UsersService, PrismaService, NotifService, FriendService, GameService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
