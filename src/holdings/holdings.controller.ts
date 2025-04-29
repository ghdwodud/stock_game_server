import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Holdings')
@UseGuards(JwtAuthGuard)
@Controller('holdings')
export class HoldingsController {
  constructor(private readonly holdingsService: HoldingsService) {}

  @Post()
  create(@Body() createHoldingDto: CreateHoldingDto) {
    return this.holdingsService.create(createHoldingDto);
  }

  @Get()
  findAll() {
    return this.holdingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holdingsService.findOne(+id);
  }

  @Get(':userId')
  getUserHoldings(@Param('userId') userId: string) {
    return this.holdingsService.findByUserId(Number(userId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHoldingDto: UpdateHoldingDto) {
    return this.holdingsService.update(+id, updateHoldingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holdingsService.remove(+id);
  }
}
