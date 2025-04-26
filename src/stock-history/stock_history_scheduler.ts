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
      // 가격 변동 비율: -10% ~ +10%
      const randomFactor = 0.1 * (Math.random() * 2 - 1);

      // 변동폭 계산
      let change = stock.price * randomFactor;

      // 변동폭 최소 0.01 이상 보장
      if (Math.abs(change) < 0.01) {
        change = 0.01 * (change >= 0 ? 1 : -1);
      }

      // 새로운 가격 계산
      let newPrice = stock.price + change;

      // 가격이 1.00 미만으로 떨어지지 않게 강제 고정
      newPrice = Math.max(newPrice, 1.0);

      // 소수점 2자리까지 반올림
      newPrice = parseFloat(newPrice.toFixed(2));

      // 새로운 가격 기록
      await this.prisma.stockHistory.create({
        data: {
          stockId: stock.id,
          price: newPrice,
        },
      });

      // stock 테이블의 가격도 업데이트
      await this.prisma.stock.update({
        where: { id: stock.id },
        data: { price: newPrice },
      });
    }
  }
}
