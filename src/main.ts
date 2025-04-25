import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { execSync } from 'child_process';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  //execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Stock Game API')
    .setDescription('주식 시뮬레이션 게임 서버 API')
    .setVersion('1.0')
    .addTag('stock') // 필요하면 여러 개 추가 가능
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api 에서 확인 가능
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}
bootstrap();
