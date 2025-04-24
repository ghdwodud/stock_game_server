import { Controller, Post, Body, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { BuyStockDto } from './dto/buy-stock.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('buy')
  async buyStock(@Body() dto: BuyStockDto, @Req() req) {
    const userId = req.user.id; // 유저 인증이 되어있다고 가정
    return this.transactionService.buyStock(userId, dto);
  }

  @Post('sell')
  sellStock(@Body() body: any) {
    return this.transactionService.sellStock(body);
  }
}
