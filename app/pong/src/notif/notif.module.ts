import { Module } from '@nestjs/common';
import { NotifService } from './notif.service';
import { PrismaService } from '../prisma.service';
import { NotifController } from './notif.controller';

@Module({
  providers: [NotifService, PrismaService],
  controllers: [NotifController]
})
export class NotifModule {}
