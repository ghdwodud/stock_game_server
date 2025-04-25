// stock-history.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StockHistoryScheduler {
  constructor(private readonly prisma: PrismaService) {}

  // 매 5초마다 실행 (초 분 시 일 월 요일)
  @Cron('*/5 * * * * *')
  async handleCron() {
    const stocks = await this.prisma.stock.findMany();

    for (const stock of stocks) {
      // 예시: 현재 가격에서 +-10% 랜덤 변화 적용
      const change = stock.price * (0.1 * (Math.random() * 2 - 1));
      const newPrice = parseFloat((stock.price + change).toFixed(2));

      await this.prisma.stockHistory.create({
        data: {
          stockId: stock.id,
          price: newPrice,
        },
      });

      // stock 테이블의 가격도 업데이트 (선택사항)
      await this.prisma.stock.update({
        where: { id: stock.id },
        data: { price: newPrice },
      });
    }
  }
}
