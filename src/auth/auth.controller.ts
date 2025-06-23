import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto, LoginDto, SignupDto } from './auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

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
    console.log('dto:', dto);
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    console.log('dto:', dto);
    return this.authService.login(dto);
  }
}
