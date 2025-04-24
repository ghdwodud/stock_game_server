import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StocksModule } from './stocks/stocks.module';
import { HoldingsModule } from './holdings/holdings.module';
import { TradesModule } from './trades/trades.module';
import { RewardsModule } from './rewards/rewards.module';
import { StockHistoryModule } from './stock-history/stock-history.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ 전역으로 환경변수 등록
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_default_secret', // .env 파일에 따로 관리 가능
      signOptions: { expiresIn: '7d' }, // 토큰 유효기간
    }),

    PrismaModule,
    UserModule,
    AuthModule,
    StocksModule,
    HoldingsModule,
    TradesModule,
    RewardsModule,
    StockHistoryModule,
    ScheduleModule.forRoot(),
    JwtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
