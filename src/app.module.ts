import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StocksModule } from './stocks/stocks.module';
import { HoldingsModule } from './holdings/holdings.module';
import { TradesModule } from './trades/trades.module';
import { RewardsModule } from './rewards/rewards.module';
import { StockModule } from './stock/stock.module';
import { StockHistoryModule } from './stock-history/stock-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ 전역으로 환경변수 등록
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    StocksModule,
    HoldingsModule,
    TradesModule,
    RewardsModule,
    StockModule,
    StockHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
