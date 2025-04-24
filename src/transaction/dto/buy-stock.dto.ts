// buy-stock.dto.ts
import { IsInt, IsPositive } from 'class-validator';

export class BuyStockDto {
  @IsInt()
  stockId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
