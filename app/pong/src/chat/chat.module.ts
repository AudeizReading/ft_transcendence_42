import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
	AuthModule,
  ],
	
  providers: [ChatGateway, PrismaService, ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
