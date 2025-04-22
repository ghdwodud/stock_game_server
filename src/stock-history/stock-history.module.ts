import { Module } from '@nestjs/common';
import { StockHistoryService } from './stock-history.service';
import { StockHistoryController } from './stock-history.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StockHistoryController],
  providers: [StockHistoryService, PrismaService],
})
export class StockHistoryModule {}
