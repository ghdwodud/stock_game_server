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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly nicknameGenerator: NicknameGeneratorService,
  ) {}

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

  async register(dto: SignupDto) {
    const { email, name, password } = dto;

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
        name,
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
        name: user.name,
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

    const accessToken = this.jwtService.sign({ sub: user.id });

    // ✅ refreshToken 발급 및 DB 저장
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7일
      },
    });

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        isGuest: user.isGuest,
      },
    };
  }
}
