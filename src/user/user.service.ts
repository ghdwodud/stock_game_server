import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: number, data: Partial<{ name: string; email: string }>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async adjustCash(id: number, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { balance: user.balance + amount },
    });
  }

  async getPortfolio(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      nickname: user.name,
      cash,
      stockValue,
      totalAsset,
      profitRate,
    };
  }

  // async addStock(userId: number, stockCode: string, quantity: number) {
  //   const existing = await this.prisma.userStock.findFirst({
  //     where: { userId, stockCode },
  //   });

  //   if (existing) {
  //     return this.prisma.userStock.update({
  //       where: { id: existing.id },
  //       data: { quantity: existing.quantity + quantity },
  //     });
  //   } else {
  //     return this.prisma.userStock.create({
  //       data: { userId, stockCode, quantity },
  //     });
  //   }
  // }

  // async subtractStock(userId: number, stockCode: string, quantity: number) {
  //   const existing = await this.prisma.userStock.findFirst({
  //     where: { userId, stockCode },
  //   });

  //   if (!existing || existing.quantity < quantity) {
  //     throw new Error('Not enough stock to subtract');
  //   }

  //   return this.prisma.userStock.update({
  //     where: { id: existing.id },
  //     data: { quantity: existing.quantity - quantity },
  //   });
  // }
}
