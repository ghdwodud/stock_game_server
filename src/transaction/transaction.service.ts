import { Injectable } from '@nestjs/common';
import { BuyStockDto } from './dto/buy-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SellStockDto } from './dto/sell-stock.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}
  async buyStock(userUuid: string, dto: BuyStockDto) {
    const { stockId, quantity } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { uuid: userUuid } });
        if (!user) {
          throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        const stock = await tx.stock.findUnique({ where: { id: stockId } });
        if (!stock) {
          throw new Error('주식 정보를 찾을 수 없습니다.');
        }

        const totalPrice = stock.price * quantity;

        if (user.balance < totalPrice) {
          throw new Error('잔고가 부족합니다.');
        }

        await tx.user.update({
          where: { id: user.id },
          data: { balance: { decrement: totalPrice } },
        });

        await tx.holding.upsert({
          where: {
            userId_stockId: {
              userId: user.id,
              stockId,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            userId: user.id,
            stockId,
            quantity,
          },
        });

        await tx.userTransaction.create({
          data: {
            userId: user.id,
            stockId,
            quantity,
            type: 'BUY',
            price: stock.price,
            total: totalPrice,
          },
        });

        return {
          success: true,
          stock,
          quantity,
          totalPrice,
        };
      });
    } catch (err) {
      console.error('❌ 매수 중 오류 발생:', err);
      throw new Error(`매수 실패: ${(err as Error).message}`);
    }
  }

  async sellStock(userUuid: string, dto: SellStockDto) {
    const { stockId, quantity } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { uuid: userUuid } });
        if (!user) {
          throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        const stock = await tx.stock.findUnique({ where: { id: stockId } });
        if (!stock) {
          throw new Error('주식 정보를 찾을 수 없습니다.');
        }

        const holding = await tx.holding.findUnique({
          where: {
            userId_stockId: {
              userId: user.id,
              stockId,
            },
          },
        });

        if (!holding || holding.quantity < quantity) {
          throw new Error('보유 수량이 부족합니다.');
        }

        const totalPrice = stock.price * quantity;

        // ✅ 잔고 증가
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { increment: totalPrice } },
        });

        // ✅ 보유 종목 수량 차감
        if (holding.quantity === quantity) {
          // 모두 매도하면 삭제해도 됨 (optional)
          await tx.holding.delete({
            where: {
              userId_stockId: {
                userId: user.id,
                stockId,
              },
            },
          });
        } else {
          await tx.holding.update({
            where: {
              userId_stockId: {
                userId: user.id,
                stockId,
              },
            },
            data: {
              quantity: { decrement: quantity },
            },
          });
        }

        // ✅ 거래 기록 저장
        await tx.userTransaction.create({
          data: {
            userId: user.id,
            stockId,
            quantity,
            type: 'SELL',
            price: stock.price,
            total: totalPrice,
          },
        });

        return {
          success: true,
          stock,
          quantity,
          totalPrice,
        };
      });
    } catch (err) {
      console.error('❌ 매도 중 오류 발생:', err);
      throw new Error(`매도 실패: ${(err as Error).message}`);
    }
  }
}
