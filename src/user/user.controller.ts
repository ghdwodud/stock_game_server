import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';

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
}
