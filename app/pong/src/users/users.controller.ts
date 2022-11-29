import { Controller, Post, Get, Request, Response, Param, UseGuards, BadRequestException,
         UploadedFile, UseInterceptors, StreamableFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt.authguard';

import { IsNumberString, IsInt, IsString } from 'class-validator';

export class ParamUserProfile {
  @IsNumberString()
  userid: number;
}

export class ParamFileInPsql {
  @IsString()
  filename: string;
}

@Controller()
export class UsersController {
  constructor(private UsersService: UsersService) {}

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  user_info(@Request() req) {
    // console.log(req.user) // <== check avalaible data served by ../auth/jwt.strategy.ts:validate
    return {
      connected: true,
      user: {
        id: req.user.id,
        name: 'CHANGEME' + req.user.login,
        avatar: req.user.avatar.replace('://<<host>>', '://' + process.env.FRONT_HOST),
        matchmaking: req.user.mMaking !== null
      }
    };
  }

  @Get('user/:userid')
  @UseGuards(JwtAuthGuard)
  async user_profile(@Request() req, @Param() param: ParamUserProfile) {
    const user = await this.UsersService.user({
      'id': Number(param.userid)
    });
    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    return {
      id: user.id,
      name: 'CHANGEME' + user.login, // TODO: Add user.name in prisma (because display name != login)
      avatar: user.avatar.replace('://<<host>>', '://' + process.env.FRONT_HOST)
    };
  }

  @Post('user/avatar-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@Request() req, @UploadedFile(
    new ParseFilePipeBuilder()
      .addMaxSizeValidator({
        maxSize: 420000
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    ) file: Express.Multer.File) {
    if (!file.mimetype.match(/^image\/(bmp|gif|jpeg|png|webp)$/))
      return { error: 1 }
    const ext = file.mimetype.replace(/^image\//, '.');
    this.UsersService.uploadImageInPsql({
      name: req.user.login + ext,
      content: file.buffer
    });
    const hash = +new Date();
    await this.UsersService.updateUser({
      where: {
        'login': req.user.login
      },
      data: {
        'avatar': 'http://<<host>>:8190/user/avatar/' + req.user.login + ext + '?' + hash
      }
    })
    return { upload: 1 }
  }

  @Get('user/avatar/:filename')
  async rootAvatar(@Request() req, @Response({ passthrough: true }) resp, @Param() param: ParamFileInPsql): Promise<StreamableFile> {
    const file = await this.UsersService.image({
      name: param.filename,
    });
    if (!file) {
      throw new BadRequestException('Invalid file');
    }
    resp.set('Content-Type', file.name.replace(/^(.*)\./, 'image/'));
    return new StreamableFile(file.content);
  }

}