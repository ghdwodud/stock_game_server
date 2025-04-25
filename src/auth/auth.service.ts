import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NicknameGeneratorService } from 'src/common/nickname-generator/nickname-generator.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly nicknameGenerator: NicknameGeneratorService,
  ) {}

  async signup(body: { name: string; email: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        authProvider: 'google', // 또는 'apple'
        isGuest: false,
        wallet: {
          create: { totalAsset: 10000000 },
        },
      },
    });

    const token = this.jwtService.sign({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(body: any) {
    throw new UnauthorizedException('이 앱은 소셜 로그인만 지원합니다.');
  }

  async guestLogin() {
    const uuid = uuidv4();
    const nickname = this.nicknameGenerator.generate();

    const user = await this.prisma.user.create({
      data: {
        uuid,
        name: nickname, // ✅ 닉네임 저장
        authProvider: 'guest',
        isGuest: true,
        wallet: {
          create: { totalAsset: 10000000 },
        },
      },
    });

    const token = this.jwtService.sign({ userUuid: user.uuid });

    return {
      token,
      user: {
        uuid: user.uuid,
        isGuest: user.isGuest,
        nickname: user.name, // ✅ 이제 정상 반환됨
      },
    };
  }

  async googleLogin(idToken: string) {
    const decoded = await this.firebaseService.verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          uuid: uuidv4(),
          name: name ?? '구글 사용자',
          email,
          authProvider: 'google',
          isGuest: false,
          avatarUrl: picture,
          wallet: {
            create: { totalAsset: 10000000 },
          },
        },
      });
    }

    const token = this.jwtService.sign({ userUuid: user.uuid });

    return {
      token,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
      },
    };
  }
}
