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
    const recent = await this.prisma.stockHistory.findMany({
      where: { stockId },
      orderBy: { timestamp: 'desc' }, // 최신부터 가져오기
      take: 30,
    });

    return recent.reverse();
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
