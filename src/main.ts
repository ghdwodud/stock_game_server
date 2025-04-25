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
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // 이 키는 아래 @ApiBearerAuth()의 인자와 연결됨
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // ✅ 한 번 Authorize 하면 브라우저에 저장됨
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}
bootstrap();
