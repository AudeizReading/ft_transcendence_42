import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { GameController } from './game.controller';
import { GameMatchMaking } from './game.matchmaking';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { NotifModule } from '../notif/notif.module';
import { GameSocketGateway } from './socket.gateway';

@Module({
  imports: [
    forwardRef(() => NotifModule),
    forwardRef(() => UsersModule),
    AuthModule,
  ],
  providers: [
    PrismaService,
    GameService,
    GameSocketGateway,
    GameMatchMaking,
  ],
  controllers: [GameController],
  exports: [GameService, GameMatchMaking],
})
export class GameModule {}
