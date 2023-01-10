import { Module, forwardRef } from '@nestjs/common';
import { InviteService } from './invite.service';
import { PrismaService } from '../prisma.service';
import { InviteController } from './invite.controller';
import { NotifModule } from '../notif/notif.module';
import { UsersModule } from '../users/users.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => GameModule),
    forwardRef(() => NotifModule),
  ],
  providers: [
    PrismaService,
    InviteService,
  ],
  controllers: [InviteController],
  exports: [InviteService],
})

export class InviteModule {}
