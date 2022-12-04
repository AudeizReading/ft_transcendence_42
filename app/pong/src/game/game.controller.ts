import { Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { GameService } from '../game/game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('matchmaking/join')
  @UseGuards(JwtAuthGuard)
  async matchmaking_join(@Request() req) {
    if (req.user.mMaking !== null)
      {} // TODO: update ?
    else
      await this.gameService.createMatchMaking({
        user: {
          connect: {
            id: req.user.id
          }
        },
        preference: "{}"
      });
    return {
      matchmaking: true,
      ...await this.gameService.listTenMatchMakings()
    };
  }

  @Get('matchmaking/info')
  async matchmaking_info() {
    return {
      matchmaking: true,
      ...await this.gameService.listTenMatchMakings()
    };
  }

  @Post('matchmaking/quit')
  @UseGuards(JwtAuthGuard)
  matchmaking_quit(@Request() req) {
    if (req.user.mMaking === null)
      return { matchmaking: false };
    else
      this.gameService.deleteMatchMaking({
        userId: req.user.id,
      });
    return {
      matchmaking: false
    };
  }

  @Get('matchmaking/confirm')
  @UseGuards(JwtAuthGuard)
  async matchmaking_confirm(@Request() req): Promise<{ result: boolean }> {
    if (req.user.mMaking?.state !== 'MATCHED')
      return { result: false };
    const result = this.gameService.updateMatchMaking({
      data: {
        state: 'CONFIRMED'
      },
      where: {
        userId: req.user.id
      }
    })
    return {
      result: !!result
    };
  }
}
