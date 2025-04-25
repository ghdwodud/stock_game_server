// buy-stock.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BuyStockDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: '주식 ID' })
  stockId: number;

  @IsNumber()
  @ApiProperty({ example: 5, description: '매수 수량' })
  quantity: number;
}
