import { IsString } from 'class-validator';
export class SignupDto {
  name: string;
  email: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class GoogleLoginDto {
  @IsString()
  idToken: string;
}
