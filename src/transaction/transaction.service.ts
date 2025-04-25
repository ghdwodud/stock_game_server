import { Injectable } from '@nestjs/common';
import { BuyStockDto } from './dto/buy-stock.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SellStockDto } from './dto/sell-stock.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}
  async buyStock(userUuid: string, dto: BuyStockDto) {
    const { stockId, quantity } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await this.findUserWithWallet(tx, userUuid);
        const stock = await this.findStock(tx, stockId);
        const totalPrice = stock.price * quantity;

        if (!user.wallet) {
          throw new Error('지갑 정보가 없습니다.');
        }

        if (user.wallet.balance < totalPrice) {
          throw new Error('잔고가 부족합니다.');
        }

        const existingHolding = await this.findHolding(tx, user.id, stockId);

        await this.updateOrCreateHolding(
          tx,
          user.id,
          stock,
          quantity,
          existingHolding,
        );
        await this.decreaseWalletBalance(tx, user.id, totalPrice);
        await this.createUserTransaction(
          tx,
          user.id,
          stock.id,
          quantity,
          stock.price,
          totalPrice,
          'BUY',
        );

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

  // 🔥 서브 함수들

  private async findUserWithWallet(
    tx: Prisma.TransactionClient,
    userUuid: string,
  ) {
    const user = await tx.user.findUnique({
      where: { uuid: userUuid },
      include: { wallet: true },
    });
    if (!user) throw new Error('유저 정보를 찾을 수 없습니다.');
    if (!user.wallet) throw new Error('지갑 정보가 없습니다.');
    return user;
  }

  private async findStock(tx: Prisma.TransactionClient, stockId: number) {
    const stock = await tx.stock.findUnique({ where: { id: stockId } });
    if (!stock) throw new Error('주식 정보를 찾을 수 없습니다.');
    return stock;
  }

  private async findHolding(
    tx: Prisma.TransactionClient,
    userId: number,
    stockId: number,
  ) {
    return tx.holding.findUnique({
      where: {
        userId_stockId: { userId, stockId },
      },
    });
  }

  private async updateOrCreateHolding(
    tx: Prisma.TransactionClient,
    userId: number,
    stock: any,
    quantity: number,
    existingHolding: any,
  ) {
    if (existingHolding) {
      const totalQuantity = existingHolding.quantity + quantity;
      const totalCost =
        existingHolding.quantity * existingHolding.avgBuyPrice +
        quantity * stock.price;
      const newAvgBuyPrice = totalCost / totalQuantity;

      await tx.holding.update({
        where: { userId_stockId: { userId, stockId: stock.id } },
        data: {
          quantity: totalQuantity,
          avgBuyPrice: newAvgBuyPrice,
        },
      });
    } else {
      await tx.holding.create({
        data: {
          userId,
          stockId: stock.id,
          quantity,
          avgBuyPrice: stock.price,
        },
      });
    }
  }

  private async decreaseWalletBalance(
    tx: Prisma.TransactionClient,
    userId: number,
    amount: number,
  ) {
    await tx.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
      },
    });
  }

  private async createUserTransaction(
    tx: Prisma.TransactionClient,
    userId: number,
    stockId: number,
    quantity: number,
    price: number,
    total: number,
    type: 'BUY' | 'SELL', // ✅ type 파라미터 추가
  ) {
    await tx.userTransaction.create({
      data: {
        userId,
        stockId,
        quantity,
        type, // ✅ 여기 type을 그대로 넣기
        price,
        total,
      },
    });
  }

  async sellStock(userUuid: string, dto: SellStockDto) {
    const { stockId, quantity } = dto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await this.findUser(tx, userUuid);
        const stock = await this.findStock(tx, stockId);
        const holding = await this.findHolding(tx, user.id, stockId);

        if (!holding || holding.quantity < quantity) {
          throw new Error('보유 수량이 부족합니다.');
        }

        const totalPrice = stock.price * quantity;

        await this.increaseWalletBalance(tx, user.id, totalPrice);
        await this.decreaseOrDeleteHolding(
          tx,
          user.id,
          stockId,
          holding.quantity,
          quantity,
        );
        await this.createUserTransaction(
          tx,
          user.id,
          stock.id,
          quantity,
          stock.price,
          totalPrice,
          'SELL',
        );

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

  private async findUser(tx: Prisma.TransactionClient, userUuid: string) {
    const user = await tx.user.findUnique({
      where: { uuid: userUuid },
    });
    if (!user) throw new Error('유저 정보를 찾을 수 없습니다.');
    return user;
  }

  private async decreaseOrDeleteHolding(
    tx: Prisma.TransactionClient,
    userId: number,
    stockId: number,
    currentQuantity: number,
    sellQuantity: number,
  ) {
    if (currentQuantity === sellQuantity) {
      await tx.holding.delete({
        where: {
          userId_stockId: { userId, stockId },
        },
      });
    } else {
      await tx.holding.update({
        where: {
          userId_stockId: { userId, stockId },
        },
        data: {
          quantity: { decrement: sellQuantity },
        },
      });
    }
  }

  private async increaseWalletBalance(
    tx: Prisma.TransactionClient,
    userId: number,
    amount: number,
  ) {
    await tx.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount },
      },
    });
  }
}
