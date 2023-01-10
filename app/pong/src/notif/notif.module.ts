import { Module, forwardRef } from '@nestjs/common';
import { NotifService } from './notif.service';
import { PrismaService } from '../prisma.service';
import { NotifController } from './notif.controller';
import { UsersModule } from '../users/users.module';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => InviteModule)
  ],
  providers: [PrismaService, NotifService],
  controllers: [NotifController],
  exports: [NotifService],
})
export class NotifModule {}
