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
import { INITIAL_ASSET } from 'src/common/nickname-generator/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly nicknameGenerator: NicknameGeneratorService,
  ) {}
  async guestLogin() {
    const uuid = uuidv4();
    const nickname = this.nicknameGenerator.generate();

    const user = await this.prisma.user.create({
      data: {
        uuid,
        name: nickname,
        authProvider: 'guest',
        isGuest: true,
        wallet: {
          create: { balance: INITIAL_ASSET },
        },
      },
    });

    const accessToken = this.jwtService.sign(
      { userUuid: user.uuid },
      { expiresIn: '1m' },
    );
    const refreshToken = this.jwtService.sign(
      { userUuid: user.uuid },
      { expiresIn: '14d' },
    );

    await this.storeRefreshToken(user.uuid, refreshToken); // ✅ refreshToken 저장

    return {
      token: accessToken,
      refreshToken, // ✅ 추가
      user: {
        uuid: user.uuid,
        name: user.name,
        isGuest: user.isGuest,
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
            create: {
              balance: INITIAL_ASSET,
            },
          },
        },
      });
    }

    const accessToken = this.jwtService.sign(
      { userUuid: user.uuid },
      { expiresIn: '15m' },
    );
    const refreshToken = uuidv4();

    // ⭐ refreshToken 테이블에 저장
    await this.storeRefreshToken(user.uuid, refreshToken);

    return {
      token: accessToken,
      refreshToken, // ✅ 이거 추가
      user: {
        uuid: user.uuid,
        name: user.name,
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
}
