import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { NotifService } from '../notif/notif.service';
import { Game, MatchMaking, Prisma } from '@prisma/client';

const MATCHMAKING_SECONDS = 25;

@Injectable()
export class GameService {
  private static alreadyRunning = 0;
  private readonly logger = new Logger(GameService.name);

  constructor(private prisma: PrismaService,
              private notifService: NotifService) {}

  
  // @Cron('45 * * * * *')
  @Interval(10000)
  async task_MatchMaking() {
    if (GameService.alreadyRunning > +new Date() - 9000)
      return ;
    GameService.alreadyRunning = +new Date();
    const count = await this.prisma.matchMaking.count({
      where: { state: 'WAITING' }
    });
    const limit = Math.min(count - (count % 2), 10); // Max 5 games each 45 seconds

    if (limit > 0) {
      this.logger.verbose('Processing MatchMaking!');

      // OK après TS, voici Prisma qui nous montre ses faiblesses :(
      // En SQL ça se fait en une seul requête mais je vais eviter de passer par du rawQuery

      for (let i = limit / 2 - 1; i >= 0; i--) {
        const couple = await this.matchMakings({
          skip: i * 2,
          take: 2,
          orderBy: { createdAt: 'asc', },
          where: { state: 'WAITING' }
        });
        console.log('couple matched: ', couple[0].userId, couple[1].userId);
        await this.prisma.matchMaking.updateMany({
          data: {
            state: 'MATCHED'
          },
          where: {
            userId: { in: [couple[0].userId, couple[1].userId] }
          }
        });
      }
    }

    const where_old: Prisma.MatchMakingWhereInput = {
      state: 'MATCHED',
      updatedAt: { lte: new Date(+new Date() - MATCHMAKING_SECONDS * 1000) }
    };
    const old = await this.prisma.matchMaking.count({
      where: where_old
    });
    if (old > 0) {
      this.logger.verbose('Cleaning MatchMaking!');
      for (let i = old - 1; i >= 0; i--) {
        const slot = await this.matchMakings({
          skip: i,
          take: 1,
          orderBy: { createdAt: 'asc', },
          where: where_old
        });
        this.notifService.createNotif(slot[0].userId, {
          text: "Vous n'avez pas confirmé à temps la partie trouvée !\n"
            + "Vous avez été quitté du MatchMaking !"
        });
        await this.prisma.matchMaking.delete({
          where: {
            userId: slot[0].userId
          }
        });
      }
    }

    const where_alone: Prisma.MatchMakingWhereInput = {
      state: 'CONFIRMED',
      updatedAt: { lte: new Date(+new Date() - MATCHMAKING_SECONDS * 1000) }
    };
    const alone = await this.prisma.matchMaking.count({
      where: where_alone
    });
    if (alone > 0) {
      this.logger.verbose('Downgrade MatchMaking!');
      for (let i = alone - 1; i >= 0; i--) {
        const slot = await this.matchMakings({
          skip: i,
          take: 1,
          orderBy: { createdAt: 'asc', },
          where: where_alone
        });
        this.notifService.createMsg(slot[0].userId, {
          text: "Votre opposant n'a pas validé à temps la partie !"
        });
        await this.prisma.matchMaking.update({
          data: {
            state: 'WAITING'
          },
          where: {
            userId: slot[0].userId
          }
        });
      }
    }

    // LOG
    if (!limit && !old && !alone)
      return;
    console.log(await this.prisma.matchMaking.count({
      where: { state: 'WAITING' }
    }), await this.prisma.matchMaking.count({
      where: { state: 'MATCHED' }
    }), await this.prisma.matchMaking.count({
      where: { state: 'CONFIRMED' }
    }), 'old:', old, 'alone:', alone);
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
