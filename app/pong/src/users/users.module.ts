import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { UsersController } from './users.controller';
import { NotifService } from '../notif/notif.service';

@Module({
  providers: [UsersService, PrismaService, NotifService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
