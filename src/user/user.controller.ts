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
import { Express, Request } from 'express';
import { diskStorage } from 'multer';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';

// 사용자 정의 Request 타입: req.user.uuid 사용 시 오류 방지
interface RequestWithUser extends Request {
  user: {
    uuid: string;
  };
}

const unlinkAsync = promisify(fs.unlink);

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
    @Req() req: RequestWithUser,
  ) {
    const uuid = req.user.uuid;

    // 새 아바타 경로
    const relativePath = `/uploads/avatars/${file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    // 기존 아바타 URL 조회
    const user = await this.userService.findByUuid(uuid);
    const oldAvatarUrl = user?.avatarUrl;

    // DB에 새 아바타 URL 먼저 저장
    await this.userService.updateAvatar(uuid, fullUrl);

    // 기존 아바타가 내부 저장소 이미지라면 삭제
    if (oldAvatarUrl && oldAvatarUrl.includes('/uploads/avatars/')) {
      const filename = oldAvatarUrl.split('/uploads/avatars/')[1];
      const oldPath = path.join(process.cwd(), 'uploads', 'avatars', filename); // ✅ 변경된 부분

      unlinkAsync(oldPath)
        .then(() => console.log(`✅ 기존 아바타 삭제됨: ${filename}`))
        .catch((err: Error) =>
          console.warn(`⚠️ 기존 아바타 삭제 실패: ${err.message}`),
        );
    }

    return { avatarUrl: fullUrl };
  }
}
