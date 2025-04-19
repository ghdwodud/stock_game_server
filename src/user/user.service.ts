import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  
  async createUser(data: { name: string; email: string }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: 'hashed_password', // 실제로는 bcrypt 처리 필요
      },
    });
  }

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

  async addStock(userId: number, stockCode: string, quantity: number) {
    const existing = await this.prisma.userStock.findFirst({
      where: { userId, stockCode },
    });

    if (existing) {
      return this.prisma.userStock.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      return this.prisma.userStock.create({
        data: { userId, stockCode, quantity },
      });
    }
  }

  async subtractStock(userId: number, stockCode: string, quantity: number) {
    const existing = await this.prisma.userStock.findFirst({
      where: { userId, stockCode },
    });

    if (!existing || existing.quantity < quantity) {
      throw new Error('Not enough stock to subtract');
    }

    return this.prisma.userStock.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity - quantity },
    });
  }
}
