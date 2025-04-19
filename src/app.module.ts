import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashBoardService } from './dashboard/dashboard.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module'; // ✅ 추가
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule], // ✅ 여기에 추가
  controllers: [DashboardController],
  providers: [DashBoardService],
})
export class AppModule {}
