import { Injectable, NotFoundException } from '@nestjs/common';
import { INITIAL_ASSET } from 'src/common/nickname-generator/constants';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUuid(uuid: string) {
    return this.prisma.user.findUnique({
      where: { uuid },
    });
  }

  async updateNameByUuid(uuid: string, name: string) {
    return this.prisma.user.update({
      where: { uuid },
      data: { name },
    });
  }

  async adjustCashByUuid(uuid: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
    });

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    return this.prisma.wallet.update({
      where: { userId: user.id },
      data:
        amount >= 0
          ? { balance: { increment: amount } }
          : { balance: { decrement: Math.abs(amount) } },
    });
  }

  async getPortfolioByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        wallet: true,
        holdings: {
          include: { stock: true },
        },
      },
    });

    if (!user) {
      console.error(`❌ UUID ${uuid}에 해당하는 유저를 찾을 수 없습니다.`);
      throw new NotFoundException('유저 정보 없음');
    }

    if (!user.wallet) {
      console.error(`❌ 유저(${user.id})의 지갑 정보가 없습니다.`);
      throw new NotFoundException('지갑 정보 없음');
    }

    const cash = user.wallet.balance;

    let stockValue = 0;
    try {
      stockValue = user.holdings.reduce((sum, holding) => {
        if (!holding.stock) {
          console.warn(
            `⚠️ 유저(${user.id})의 holding(${holding.id})에 연결된 주식 정보가 없습니다.`,
          );
          return sum;
        }
        return sum + holding.quantity * holding.stock.price;
      }, 0);
    } catch (e) {
      console.error(`❌ 주식 평가금액 계산 중 오류:`, e);
      throw new Error('보유 주식 평가 계산 중 문제가 발생했습니다.');
    }

    const totalAsset = cash + stockValue;
    const initialAsset = INITIAL_ASSET;
    const profitRate = (totalAsset - initialAsset) / initialAsset;

    const holdings = user.holdings.map((h) => ({
      stockId: h.stockId,
      quantity: h.quantity,
      avgBuyPrice: h.avgBuyPrice, // ✅ 추가
    }));

    return {
      nickname: user.name ?? '이름 없음',
      cash,
      stockValue,
      totalAsset,
      profitRate,
      holdings,
    };
  }

  async incrementCash(userUuid: string, amount: number) {
    // 1. 먼저 userUuid로 user.id를 찾아야 함
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
      select: { id: true },
    });

    if (!user) {
      throw new Error('유저를 찾을 수 없습니다.');
    }

    // 2. user.id로 wallet balance를 업데이트
    await this.prisma.wallet.update({
      where: { userId: user.id },
      data: {
        balance: { increment: amount },
      },
    });
  }
  async getUserIdByUuid(uuid: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    return user.id;
  }
}
