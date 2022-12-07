import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotifService } from '../notif/notif.service';
import { Game, MatchMaking, Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService,
              private notifService: NotifService) {}

  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
  ): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: gameWhereUniqueInput,
    });
  }

  async createGame(data: Prisma.GameCreateInput): Promise<Game> {
    return this.prisma.game.create({
      data,
    });
  }

  async listTenMatchMakings(): Promise<any> {
    const rawAvatars = await this.matchMakings({
      take: 10,
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        user: { 
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });
    const avatars = []
    rawAvatars.map((item) => {
      avatars.push({
        name: item.user.name,
        avatar: item.user.avatar.replace('://<<host>>', '://' + process.env.FRONT_HOST)
      })
    })
    return {
      count: await this.matchMakingCount(),
      avatars: avatars
    };
  }

  async matchMakings(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MatchMakingWhereUniqueInput;
    where?: Prisma.MatchMakingWhereInput;
    orderBy?: Prisma.MatchMakingOrderByWithRelationInput;
    select?: Prisma.MatchMakingSelect; // https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findmany
    include?: Prisma.MatchMakingInclude; // https://www.prisma.io/docs/concepts/components/prisma-client/select-fields#include-relations-and-select-relation-fields
  }): Promise<any> { // hack: any… because select
    const { skip, take, cursor, where, orderBy, select, include } = params;
    const opt: any = {}
    if (include)
        opt.include = include
    else
        opt.select = select
    return this.prisma.matchMaking.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      ...opt,
    });
  }

  async updateMatchMaking(params: {
    where: Prisma.MatchMakingWhereUniqueInput;
    data: Prisma.MatchMakingUpdateInput;
  }): Promise<MatchMaking> {
    const { where, data } = params;
    return this.prisma.matchMaking.update({
      data,
      where,
    });
  }

  async matchMakingCount(): Promise<number> {
    return this.prisma.matchMaking.count();
  }

  async createMatchMaking(data: Prisma.MatchMakingCreateInput): Promise<MatchMaking> {
    return this.prisma.matchMaking.create({
      data,
    });
  }

  async deleteMatchMaking(where: Prisma.MatchMakingWhereUniqueInput): Promise<MatchMaking> {
    return this.prisma.matchMaking.delete({
      where,
    });
  }
}
