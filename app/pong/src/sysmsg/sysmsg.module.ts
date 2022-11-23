import { Module } from '@nestjs/common';
import { SysMsgService } from './sysmsg.service';
import { PrismaService } from '../prisma.service';
import { SysMsgController } from './sysmsg.controller';

@Module({
  providers: [SysMsgService, PrismaService],
  controllers: [SysMsgController]
})
export class SysMsgModule {}
