// sell-stock.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SellStockDto {
  @IsNumber()
  @ApiProperty({ example: 1, description: '주식 ID' })
  stockId: number;

  @IsNumber()
  @ApiProperty({ example: 2, description: '매도 수량' })
  quantity: number;
}
