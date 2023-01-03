import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Notif, Prisma } from '@prisma/client';

interface MsgContent {
  text: string;
  type?: 'info' | 'warning';
}

interface NotifContent {
  text: string;
  url?: string | null;
}

export interface ActionRedirContent {
  url: string;
  type: 'redir';
}

export interface NotifDataType {
  text: string;
  date: string;
  url?: string | null;
  read: boolean;
  type: string;
}

export interface NotifContainerType {
  num: number;
  arr: Array<NotifDataType>;
}

@Injectable()
export class NotifService {
  constructor(private prisma: PrismaService) {}

  async createAction(
    userId: number,
    content: ActionRedirContent,
  ): Promise<Notif> {
    return this.prisma.notif.create({
      data: {
        userId,
        content: JSON.stringify(content),
        read: false,
        type: 'ACTION',
      },
    });
  }

  async createMsg(userId: number, content: MsgContent): Promise<Notif> {
    return this.prisma.notif.create({
      data: {
        userId,
        content: JSON.stringify(content),
        read: false,
        type: 'MSG',
      },
    });
  }

  async createNotif(userId: number, content: NotifContent): Promise<Notif> {
    return this.prisma.notif.create({
      data: {
        userId,
        content: JSON.stringify(content),
        read: false,
        type: 'NOTIF',
      },
    });
  }

  async readsNotif(userId: number, date: Date): Promise<{ count: number }> {
    return this.prisma.notif.updateMany({
      data: {
        read: true,
      },
      where: {
        userId,
        type: 'NOTIF',
        createdAt: { lte: date },
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

  async deleteNotifs(
    where: Prisma.NotifWhereInput,
  ): Promise<{ count: number }> {
    return this.prisma.notif.deleteMany({
      where,
    });
  }

  async objectForFront(userId: number): Promise<{
    notifs: NotifContainerType;
    msgs: NotifContainerType;
    actions: NotifContainerType;
  }> {
    const notifs = [];
    const msgs = [];
    const actions = [];
    const data = await this.notifs({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    data.forEach((item) => {
      const content: MsgContent | NotifContent | ActionRedirContent =
        JSON.parse(item.content);
      const container = (() => {
        switch (item.type) {
          case 'NOTIF':
            return notifs;
          case 'MSG':
            return msgs;
          case 'ACTION':
            return actions;
        }
      })();
      container.push({
        text: content['text'] || null,
        date: item.createdAt,
        url: content['url'] || null,
        read: item.read,
        type: content['type'] || null,
      });
    });
    return {
      notifs: {
        num: notifs.length,
        arr: notifs,
      },
      msgs: {
        num: msgs.length,
        arr: msgs,
      },
      actions: {
        num: actions.length,
        arr: actions,
      },
    };
  }
}
