import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto, LoginDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NicknameGeneratorService } from 'src/common/nickname-generator/nickname-generator.service';
import { INITIAL_ASSET } from 'src/common/nickname-generator/constants';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly nicknameGenerator: NicknameGeneratorService,
  ) {}

  async logout(userUuid: string, refreshToken: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new BadRequestException('유효하지 않은 사용자입니다.');
    }
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        token: refreshToken,
      },
    });
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
          nickname: name ?? '구글 사용자',
          email,
          authProvider: 'google',
          isGuest: false,
          avatarUrl: picture,
          wallet: {
            create: {
              balance: INITIAL_ASSET,
            },
          },
        },
      });
    }
    const accessToken = this.createAccessToken(user);
    const refreshToken = uuidv4();
    await this.storeRefreshToken(user.uuid, refreshToken);

    return {
      token: accessToken,
      refreshToken,
      user: {
        uuid: user.uuid,
        nickname: user.nickname,
        email: user.email,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || !tokenRecord.user) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    const accessToken = this.jwtService.sign(
      { userUuid: tokenRecord.user.uuid },
      { expiresIn: '15m' },
    );

    const newRefreshToken = this.jwtService.sign(
      { userUuid: tokenRecord.user.uuid },
      { expiresIn: '14d' },
    );

    // 기존 refreshToken 레코드 갱신
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: newRefreshToken },
    });

    return {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async storeRefreshToken(userUuid: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 예시: 7일 후 만료
      },
    });
  }

  async register(dto: SignupDto) {
    const { email, nickname, password } = dto;

    // 1. 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    // 2. 비밀번호 해싱
    const hashed = await bcrypt.hash(password, 10);

    // 3. 유저 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        nickname,
        password: hashed,
        authProvider: 'email',
        isGuest: false,
      },
    });

    // 4. 지갑 생성
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
      },
    });

    // 5. 토큰 발급
    const token = this.jwtService.sign({ sub: user.id });

    return {
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname,
        authProvider: user.authProvider,
        isGuest: user.isGuest,
      },
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.authProvider !== 'email' || !user.password) {
      throw new BadRequestException('이메일/비밀번호가 올바르지 않습니다.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('이메일/비밀번호가 올바르지 않습니다.');
    }

    const accessToken = this.createAccessToken(user);
    const refreshToken = uuidv4();
    await this.storeRefreshToken(user.uuid, refreshToken);

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        nickname: user.nickname,
        authProvider: user.authProvider,
        isGuest: user.isGuest,
      },
    };
  }

  private createAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      userUuid: user.uuid,
      email: user.email,
      // 필요 시 역할, 권한 등도 추가 가능
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
  }

  private async generateTokensAndSave(
    user: User,
  ): Promise<{ token: string; refreshToken: string }> {
    const token = this.createAccessToken(user);
    const refreshToken = uuidv4();

    await this.storeRefreshToken(user.uuid, refreshToken);

    return { token, refreshToken };
  }
}
