import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Notif, Prisma } from '@prisma/client';

interface NotifContent {
  text: string;
  url?: string | null;
}

@Injectable()
export class NotifService {
  constructor(private prisma: PrismaService) {}

  async createNotif(userId: number, content: NotifContent): Promise <Notif> {
    return this.prisma.notif.create({
      data: {
        userId,
        content: JSON.stringify(content)
      },
    });
  }

  async notif(
    notifWhereUniqueInput: Prisma.NotifWhereUniqueInput,
  ): Promise<Notif | null> {
    return this.prisma.notif.findUnique({
      where: notifWhereUniqueInput,
    });
  }

  async notifs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.NotifWhereUniqueInput;
    where?: Prisma.NotifWhereInput;
    orderBy?: Prisma.NotifOrderByWithRelationInput;
  }): Promise<Notif[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.notif.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async objectForFront(userId: number): Promise<{
    num: number,
    arr: Array<{
      text: string,
      date: string,
      url: string | null
    }>
  }> {
    const arr = [];
    const notifs = await this.notifs({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    notifs.forEach((notif) => {
      const obj: NotifContent = JSON.parse(notif.content);
      arr.push({
        text: obj.text,
        date: notif.createdAt,
        url: obj.url || null
      })
    })
    return {
      num: arr.length,
      arr
    }
  }
}
