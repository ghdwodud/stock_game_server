import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}
  create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  async findAll() {
    const stocks = await this.prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
    });

    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const result = await Promise.all(
      stocks.map(async (stock) => {
        const referenceHistory = await this.prisma.stockHistory.findFirst({
          where: {
            stockId: stock.id,
            timestamp: { lte: tenMinutesAgo }, // 10분 전에 가장 가까운 기록
          },
          orderBy: {
            timestamp: 'desc', // 가장 최근 기록
          },
        });

        let changeRate = 0;
        if (referenceHistory) {
          changeRate =
            ((stock.price - referenceHistory.price) / referenceHistory.price) *
            100;
        }

        return {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          changeRate: parseFloat(changeRate.toFixed(2)), // 퍼센트로
        };
      }),
    );

    return result;
  }

  async updateAllPrices(): Promise<void> {
    const stocks = await this.prisma.stock.findMany();

    for (const stock of stocks) {
      const changeRate = this.getRandomChangeRate();
      const newPrice = +(stock.price * (1 + changeRate)).toFixed(2);

      await this.prisma.stock.update({
        where: { id: stock.id },
        data: {
          price: newPrice,
          changeRate: +(changeRate * 100).toFixed(2), // 퍼센트로 저장
        },
      });
    }
  }

  private getRandomChangeRate(): number {
    const maxChange = 0.05; // ±5% 내외 변동
    const minChange = -0.05;

    const isUp = Math.random() < 0.5;
    const change = Math.random() * maxChange;

    return isUp ? change : -change;
  }

  async findOne(id: number) {
    return this.prisma.stock.findUnique({
      where: { id },
    });
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
