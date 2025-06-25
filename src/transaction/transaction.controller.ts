import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { BuyStockDto } from './dto/buy-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token') // ✅ JWT 인증 헤더 표시
@ApiTags('Transactions') // ✅ Swagger 그룹명
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주식 매수' })
  @ApiBody({ type: BuyStockDto })
  async buyStock(@Req() req: RequestWithUser, @Body() dto: BuyStockDto) {
    return this.transactionService.buyStock(req.user.uuid, dto);
  }

  @Post('sell')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주식 매도' })
  @ApiBody({ type: SellStockDto })
  async sellStock(@Req() req: RequestWithUser, @Body() dto: SellStockDto) {
    return this.transactionService.sellStock(req.user.uuid, dto);
  }
}
