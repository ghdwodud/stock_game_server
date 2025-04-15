import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashBoardService } from './dashboard/dashboard.service';


@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [DashBoardService],
})
export class AppModule {}
