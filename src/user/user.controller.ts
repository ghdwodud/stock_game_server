import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Express } from 'express';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':uuid')
  @ApiOperation({ summary: '유저 조회 (UUID 기반)' })
  @ApiParam({ name: 'uuid', type: String })
  async getUser(@Param('uuid') uuid: string) {
    return this.userService.findByUuid(uuid);
  }

  @Get(':uuid/portfolio')
  @ApiOperation({ summary: '유저 포트폴리오 조회 (UUID 기반)' })
  @ApiParam({ name: 'uuid', type: String })
  getPortfolio(@Param('uuid') uuid: string) {
    return this.userService.getPortfolioByUuid(uuid);
  }

  @Patch(':uuid/cash')
  @ApiOperation({ summary: '유저 잔액 수정 (UUID 기반)' })
  @ApiParam({ name: 'uuid', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
      },
      required: ['amount'],
    },
  })
  async adjustCash(
    @Param('uuid') uuid: string,
    @Body() body: { amount: number },
  ) {
    return this.userService.adjustCashByUuid(uuid, body.amount);
  }

  @Patch(':uuid/name')
  @ApiOperation({ summary: '유저 이름 변경 (UUID 기반)' })
  @ApiParam({ name: 'uuid', type: String })
  async updateName(
    @Param('uuid') uuid: string,
    @Body() body: { name: string },
  ) {
    return this.userService.updateNameByUuid(uuid, body.name);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @ApiOperation({ summary: '아바타 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const uuid = req.user.uuid;
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.userService.updateAvatar(uuid, avatarUrl);
    return { avatarUrl };
  }
}
