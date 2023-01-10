import { Module, forwardRef } from '@nestjs/common';
import { FriendService } from './friend.service';
import { PrismaService } from '../prisma.service';
import { FriendController } from './friend.controller';
import { UsersModule } from '../users/users.module';
import { NotifModule } from '../notif/notif.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => NotifModule)
  ],
  providers: [PrismaService, FriendService],
  controllers: [FriendController],
  exports: [FriendService]
})
export class FriendModule {}
