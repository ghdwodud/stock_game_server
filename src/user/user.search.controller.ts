import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { Req } from '@nestjs/common';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class UserSearchController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiQuery({ name: 'q', required: false, description: '닉네임 검색어' })
  async searchUsers(@Query('q') query: string, @Req() req: RequestWithUser) {
    if (!query || query.trim() === '') {
      return { message: '검색어가 필요합니다.' };
    }

    return this.userService.searchUsers(query, req.user.uuid);
  }
}
