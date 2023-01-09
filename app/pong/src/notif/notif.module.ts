import { Module } from '@nestjs/common';
import { NotifService } from './notif.service';
import { PrismaService } from '../prisma.service';
import { NotifController } from './notif.controller';
import { UsersService } from '../users/users.service';

@Module({
  providers: [NotifService, PrismaService, UsersService],
  controllers: [NotifController],
  exports: [NotifService],
})
export class NotifModule {}
