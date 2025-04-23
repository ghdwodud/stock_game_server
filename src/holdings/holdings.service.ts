import { Injectable } from '@nestjs/common';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HoldingsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createHoldingDto: CreateHoldingDto) {
    return 'This action adds a new holding';
  }

  findAll() {
    return `This action returns all holdings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} holding`;
  }

  update(id: number, updateHoldingDto: UpdateHoldingDto) {
    return `This action updates a #${id} holding`;
  }

  remove(id: number) {
    return `This action removes a #${id} holding`;
  }

  async findByUserId(userId: number) {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      include: { stock: true },
    });

    return holdings.map((h) => ({
      stockId: h.stockId,
      symbol: h.stock.symbol,
      name: h.stock.name,
      quantity: h.quantity,
      price: h.stock.price,
    }));
  }
}
