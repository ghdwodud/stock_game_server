import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [StocksController],
  providers: [StocksService, PrismaService],
})
export class StocksModule {}
