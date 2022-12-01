import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { Game, MatchMaking, Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('45 * * * * *')
  async task_MatchMaking() {
    const count = await this.prisma.matchMaking.count({
      where: { state: "WAITING" }
    });
    const limit = Math.min(count - (count % 2), 10);

    if (limit <= 0)
      return

    this.logger.verbose('Process MatchMaking!');

    // OK après TS, voici Prisma qui nous montre ses faiblesses :(

    for (let i = limit / 2 - 1; i >= 0; i--) {
      console.log(i);
    }

    console.log(await this.prisma.matchMaking.count({
      where: { state: "WAITING" }
    }), await this.prisma.matchMaking.count({
      where: { state: "MATCHED" }
    }));
  }

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
        avatar: item.user.avatar
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
