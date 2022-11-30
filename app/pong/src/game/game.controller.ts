import { Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { GameService } from '../game/game.service';

@Controller('game')
export class GameController {
  constructor(private GameService: GameService) {}

  @Post('matchmaking/join')
  @UseGuards(JwtAuthGuard)
  async matchmaking_join(@Request() req) {
    if (req.user.mMaking !== null)
      {} // TODO: update ?
    else
      await this.GameService.createMatchMaking({
        user: {
          connect: {
            id: req.user.id
          }
        },
        preference: "{}"
      });
    return {
      matchmaking: true,
      ...await this.GameService.listTenMatchMakings()
    };
  }

  @Get('matchmaking/info')
  async matchmaking_info() {
    return {
      matchmaking: true,
      ...await this.GameService.listTenMatchMakings()
    };
  }

  @Post('matchmaking/quit')
  @UseGuards(JwtAuthGuard)
  matchmaking_quit(@Request() req) {
    if (req.user.mMaking === null)
      return { matchmaking: false };
    else
      this.GameService.deleteMatchMaking({
        userId: req.user.id,
      });
    return {
      matchmaking: false
    };
  }
}
