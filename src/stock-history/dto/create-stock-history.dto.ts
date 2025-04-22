import { IsNumber } from 'class-validator';

export class CreateStockHistoryDto {
  @IsNumber()
  stockId: number;

  @IsNumber()
  price: number;
}
