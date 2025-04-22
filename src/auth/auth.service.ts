import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(body: { name: string; email: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashed = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: hashed,
      },
    });

    return {
      userUuid: user.uuid,
      name: user.name,
      email: user.email,
    };
  }
  async login(body: LoginDto) {
    return { message: `로그인 시도: ${body.email}` };
  }
}
