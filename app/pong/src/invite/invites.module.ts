import { Module } from '@nestjs/common';
import { GameModule } from 'src/game/game.module';
import { NotifModule } from 'src/notif/notif.module';
import { NotifService } from 'src/notif/notif.service';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { GameSettingsInterface, InviteController, InviteDTO } from './invites.controller';
import { InviteService } from './invites.service';

@Module({
	imports: [UsersModule, NotifModule, GameModule],
  providers: [PrismaService, InviteService],
  controllers: [InviteController],
	exports: [InviteService],
})

export class InviteModule {}
