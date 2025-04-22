import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}
  private stocks = [
    { symbol: 'AAPL', name: '애플', price: 190.25, changeRate: 0 },
    { symbol: 'TSLA', name: '테슬라', price: 720.0, changeRate: 0 },
    { symbol: 'GOOGL', name: '구글', price: 134.5, changeRate: 0 },
    { symbol: 'NVDA', name: '엔비디아', price: 1050.3, changeRate: 0 },
  ];
  create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  async findAll() {
    return this.prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
    });
  }

  updateAllPrices(): void {
    this.stocks = this.stocks.map((stock) => {
      const changeRate = this.getRandomChangeRate();
      const newPrice = +(stock.price * (1 + changeRate)).toFixed(2);
      return {
        ...stock,
        price: newPrice,
        changeRate: +(changeRate * 100).toFixed(2), // 퍼센트로 표기
      };
    });
  }

  private getRandomChangeRate(): number {
    const maxChange = 0.05; // ±5% 내외 변동
    const minChange = -0.05;

    const isUp = Math.random() < 0.5;
    const change = Math.random() * maxChange;

    return isUp ? change : -change;
  }

  findOne(id: number) {
    return this.stocks[id] ?? null;
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
