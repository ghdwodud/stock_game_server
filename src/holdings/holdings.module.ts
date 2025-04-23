import { Module } from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { HoldingsController } from './holdings.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [HoldingsController],
  providers: [HoldingsService, PrismaService],
})
export class HoldingsModule {}
