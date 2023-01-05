import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { PrismaService } from '../prisma.service';
import { FriendController } from './friend.controller';
import { UsersService } from '../users/users.service';
import { NotifService } from 'src/notif/notif.service';

@Module({
  providers: [FriendService, PrismaService, UsersService, NotifService],
  controllers: [FriendController],
})
export class FriendModule {}
