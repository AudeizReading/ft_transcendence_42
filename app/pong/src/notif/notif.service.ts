import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Notif, Prisma } from '@prisma/client';

interface NotifContent {
  text: string;
  url?: string | null;
  read?: boolean;
  type?: string;
}

export interface NotifDataType {
  text: string;
  date: string;
  url?: string | null;
  read: boolean;
  type: string;
}

@Injectable()
export class NotifService {
  constructor(private prisma: PrismaService) {}

  async createMsg(userId: number, content: NotifContent): Promise<Notif> {
    return this.prisma.notif.create({
      data: {
        userId,
        content: JSON.stringify(content),
        read: false,
        type: 'MSG'
      },
    });
  }

  async createNotif(userId: number, content: NotifContent): Promise<Notif> {
    return this.prisma.notif.create({
      data: {
        userId,
        content: JSON.stringify(content),
        read: false
      },
    });
  }

  async readsNotif(userId: number, date: Date): Promise<{ count: number }> {
    return this.prisma.notif.updateMany({
      data: {
        read: true
      },
      where: {
        userId,
        type: 'NOTIF',
        createdAt: { lte: date }
      }
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

  async deleteNotifs(where: Prisma.NotifWhereInput): Promise<{ count: number }> {
    return this.prisma.notif.deleteMany({
      where,
    });
  }

  async objectForFront(userId: number): Promise<{
    notifs: { num: number, arr: Array<NotifDataType> },
    msgs: { num: number, arr: Array<NotifDataType> }
  }> {
    const notifs = [];
    const msgs = [];
    const data = await this.notifs({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    data.forEach((item) => {
      const content: NotifContent = JSON.parse(item.content);
      (item.type === 'NOTIF' ? notifs : msgs).push({
        text: content.text,
        date: item.createdAt,
        url: content.url || null,
        read: item.read,
        type: item.type
      })
    })
    return {
      notifs: {
        num: notifs.length,
        arr: notifs
      },
      msgs: {
        num: msgs.length,
        arr: msgs
      }
    }
  }
}
