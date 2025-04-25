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
          create: { balance: INITIAL_ASSET }, // ✅ 수정 완료
        },
      },
    });
  
    const token = this.jwtService.sign({ userUuid: user.uuid });
  
    return {
      token,
      user: {
        uuid: user.uuid,
        isGuest: user.isGuest,
        nickname: user.name,
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
              balance: INITIAL_ASSET, // ✅ totalAsset 제거, balance만 초기화
            },
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
