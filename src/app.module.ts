import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashBoardService } from './dashboard/dashboard.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module'; // ✅ 추가

@Module({
  imports: [PrismaModule, UserModule], // ✅ 여기에 추가
  controllers: [DashboardController],
  providers: [DashBoardService],
})
export class AppModule {}
