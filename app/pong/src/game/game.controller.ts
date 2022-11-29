import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';
import { GameService } from '../game/game.service';

@Controller('game')
export class GameController {
  constructor(private GameService: GameService) {}

  @Post('matchmaking/join')
  @UseGuards(JwtAuthGuard)
  matchmaking_join(@Request() req) {
    if (req.user.mMaking !== null)
      return { matchmaking: true }; // TODO: update ?
    else
      this.GameService.createMatchMaking({
        user: {
          connect: {
            id: req.user.id
          }
        },
        preference: "{}"
      });
    return {
      matchmaking: true
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
