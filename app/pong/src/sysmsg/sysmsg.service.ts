import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, SysMessage, Prisma } from '@prisma/client';

@Injectable()
export class SysMsgService {
  constructor(private prisma: PrismaService) {}

  async sysmsgs(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }
}
