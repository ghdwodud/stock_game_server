import { Module } from '@nestjs/common';
import { NicknameGeneratorService } from './nickname-generator.service';

@Module({
  providers: [NicknameGeneratorService],
  exports: [NicknameGeneratorService],
})
export class NicknameGeneratorModule {}
