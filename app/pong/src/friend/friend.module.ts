import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { PrismaService } from '../prisma.service';
import { FriendController } from './friend.controller';
import { UsersService } from '../users/users.service';

@Module({
  providers: [FriendService, PrismaService, UsersService],
  controllers: [FriendController],
})
export class FriendModule {}
