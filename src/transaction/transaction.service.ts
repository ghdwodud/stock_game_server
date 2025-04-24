import { Injectable } from '@nestjs/common';
import { BuyStockDto } from './dto/buy-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}
  async buyStock(userId: number, dto: BuyStockDto) {
    const { stockId, quantity } = dto;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const stock = await tx.stock.findUnique({ where: { id: stockId } });

      if (!user || !stock) {
        throw new Error('유저 또는 주식 정보를 찾을 수 없습니다.');
      }

      const totalPrice = stock.price * quantity;

      if (user.balance < totalPrice) {
        throw new Error('잔고가 부족합니다.');
      }

      // 유저 잔고 차감
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: totalPrice } },
      });

      // 보유 종목 업데이트 or 생성 (upsert)
      await tx.holding.upsert({
        where: {
          userId_stockId: {
            userId,
            stockId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          userId,
          stockId,
          quantity,
        },
      });

      // 거래 기록 저장
      await tx.userTransaction.create({
        data: {
          userId,
          stockId,
          quantity,
          type: 'BUY',
          price: stock.price,
          total: totalPrice,
        },
      });

      return { success: true, stock, quantity, totalPrice };
    });
  }

  sellStock(body: any) {
    // TODO: 실제 로직 구현
    console.log('매도 요청:', body);
    return { success: true, message: '매도 완료' };
  }
}
