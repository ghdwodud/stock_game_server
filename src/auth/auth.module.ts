import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from 'src/firebase/firebase.module'; // ✅ import 모듈
import { NicknameGeneratorModule } from 'src/common/nickname-generator';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '7d' },
    }),
    FirebaseModule, // ✅ 여기만 추가하면 FirebaseService도 같이 사용 가능
    NicknameGeneratorModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
