// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { beforeEach, describe, it } from 'node:test';

// describe('AuthService', () => {
//   let service: AuthService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [AuthService, PrismaService],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined(); // ✅ 서비스가 정상 생성되는지 확인
//   });

//   it('should create user with valid data', async () => {
//     const result = await service.signup({
//       name: '테스트',
//       email: 'test@example.com',
//     });

//     expect(result.user.email).toBe('test@example.com');
//   });
// });
