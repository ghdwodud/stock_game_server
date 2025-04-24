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
import { CreateUserDto } from 'src/stock-history/dto/create-user.dto';

@ApiTags('users') // ✅ Swagger 그룹명
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: '유저 조회' })
  @ApiParam({ name: 'id', type: Number })
  async getUser(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }

  // user.controller.ts
  @Get(':userId/portfolio')
  getPortfolio(@Param('userId') userId: string) {
    return this.userService.getPortfolio(Number(userId));
  }

  @Patch(':id/cash')
  @ApiOperation({ summary: '유저 잔액 수정' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
      },
      required: ['amount'],
    },
  })
  async adjustCash(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.userService.adjustCash(Number(id), body.amount);
  }

  @Patch(':id/name')
  @ApiOperation({ summary: '유저 이름 변경' })
  async updateName(@Param('id') id: string, @Body() body: { name: string }) {
    return this.userService.updateUser(Number(id), { name: body.name });
  }
}
``
