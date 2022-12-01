import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Notif, Prisma } from '@prisma/client';

@Injectable()
export class NotifService {
  constructor(private prisma: PrismaService) {}

  async notifs(
    notifWhereUniqueInput: Prisma.NotifWhereUniqueInput,
  ): Promise<Notif | null> {
    return this.prisma.notif.findUnique({
      where: notifWhereUniqueInput,
    });
  }
}
