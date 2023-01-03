import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    SocketGateway,
    JwtService,
    JwtStrategy,
    UsersService,
    PrismaService,
  ],
  exports: [SocketGateway],
})
export class SocketModule {}
