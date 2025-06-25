import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto, LoginDto, SignupDto } from './auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './types/request-with-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('google-login')
  async googleLogin(@Body() body: GoogleLoginDto) {
    return this.authService.googleLogin(body.idToken);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('register')
  async register(@Body() dto: SignupDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: RequestWithUser,
    @Body('refreshToken') refreshToken: string,
  ) {
    await this.authService.logout(req.user.uuid, refreshToken);
    return { message: '로그아웃 성공' };
  }
}
