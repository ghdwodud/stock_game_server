import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockHistoryDto } from './dto/create-stock-history.dto';
import { UpdateStockHistoryDto } from './dto/update-stock-history.dto';

@Injectable()
export class StockHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStockHistoryDto: CreateStockHistoryDto) {
    return this.prisma.stockHistory.create({
      data: createStockHistoryDto,
    });
  }

  async findAll() {
    return this.prisma.stockHistory.findMany();
  }

  async findOne(id: number) {
    return this.prisma.stockHistory.findUnique({
      where: { id },
    });
  }

  async findByStockId(stockId: number) {
    return this.prisma.stockHistory.findMany({
      where: { stockId },
      orderBy: { timestamp: 'asc' }, // 또는 'desc'로 바꿔도 됨
      take: 30, // 최근 30개만 조회 (필요 시 조절 가능)
    });
  }

  async update(id: number, updateStockHistoryDto: UpdateStockHistoryDto) {
    return this.prisma.stockHistory.update({
      where: { id },
      data: updateStockHistoryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.stockHistory.delete({
      where: { id },
    });
  }
}
