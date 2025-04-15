import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  @Get()
  @ApiQuery({ name: 'userId', required: true, description: '유저 UUID' })
  getDashboard(@Query('userId') userId: string) {
    return {
      cash: 1000000,
      myStocks: [
        { symbol: 'NVDA', price: 920.5, quantity: 3 },
        { symbol: 'AAPL', price: 195.1, quantity: 5 },
      ],
      allStocks: [
        { symbol: 'NVDA', price: 911.3 },
        { symbol: 'AAPL', price: 195.1 },
        { symbol: 'GOOGL', price: 2820.0 },
      ],
    };
  }
}
