import { Module } from '@nestjs/common';
import { StockHistoryService } from './stock-history.service';
import { StockHistoryController } from './stock-history.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockHistoryScheduler } from './stock_history_scheduler';

@Module({
  controllers: [StockHistoryController],
  providers: [StockHistoryService, PrismaService, StockHistoryScheduler],
})
export class StockHistoryModule {}
