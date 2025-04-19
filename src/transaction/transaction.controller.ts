import { Controller, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';


@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('buy')
  buyStock(@Body() body: any) {
    return this.transactionService.buyStock(body);
  }

  @Post('sell')
  sellStock(@Body() body: any) {
    return this.transactionService.sellStock(body);
  }
}
