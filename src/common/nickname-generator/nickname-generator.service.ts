import { Injectable } from '@nestjs/common';

@Injectable()
export class NicknameGeneratorService {
  private charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  private length = 8;

  generate(): string {
    let result = '';
    for (let i = 0; i < this.length; i++) {
      const randomIndex = Math.floor(Math.random() * this.charset.length);
      result += this.charset[randomIndex];
    }
    return `guest_${result}`;
  }
}
