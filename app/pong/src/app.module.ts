import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule.forRoot({
    // isGlobal: true,  ????????
    envFilePath: ['.env'],
  }), AuthModule, UsersModule],
  controllers: [AppController, AuthController],
  providers: [AppService, JwtService],
})
export class AppModule {}
