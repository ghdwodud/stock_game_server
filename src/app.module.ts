import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ 이거 추가
import { DashboardController } from './dashboard/dashboard.controller';
import { DashBoardService } from './dashboard/dashboard.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ 전역으로 환경변수 등록
    }),
    PrismaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashBoardService],
})
export class AppModule {}
