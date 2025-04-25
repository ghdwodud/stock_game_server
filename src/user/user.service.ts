import { Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.prisma.user.findUnique({ where: { uuid } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    return this.prisma.user.update({
      where: { uuid },
      data: { balance: user.balance + amount },
    });
  }

  async getPortfolioByUuid(uuid: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid },
      include: {
        wallet: true,
      },
    });

    if (!user || !user.wallet) {
      throw new NotFoundException('유저 또는 지갑 정보 없음');
    }

    const totalAsset = user.wallet.totalAsset;
    const cash = user.balance;
    const stockValue = totalAsset - cash;
    const initialAsset = 10_000_000; // 기본 시작 금액
    const profitRate = (totalAsset - initialAsset) / initialAsset;

    return {
      nickname: user.name ?? '이름 없음',
      cash,
      stockValue,
      totalAsset,
      profitRate,
    };
  }
}
