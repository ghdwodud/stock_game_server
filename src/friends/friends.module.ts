import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PrismaModule } from 'src/prisma/prisma.module'; // ✅
import { UserModule } from 'src/user/user.module'; // ✅

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
