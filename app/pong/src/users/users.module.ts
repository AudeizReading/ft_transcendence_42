import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersController } from './users.controller';
import { NotifModule } from '../notif/notif.module';
import { FriendModule } from '../friend/friend.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    forwardRef(() => NotifModule),
    forwardRef(() => FriendModule),
    forwardRef(() => GameModule)
  ],
  providers: [PrismaService, UsersService], 
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
