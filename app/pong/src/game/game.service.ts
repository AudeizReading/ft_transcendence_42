import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, MatchMaking, Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

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
