import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserSearchController } from './user.search.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserSearchController, UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
