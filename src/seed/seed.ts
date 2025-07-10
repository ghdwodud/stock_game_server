import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 DB 초기화...');
  await prisma.refreshToken.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.userTransaction.deleteMany();
  await prisma.holding.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.stock.deleteMany();
  console.log('✅ 초기화 완료\n');

  // 🟩 유저 100명 생성
  const users: User[] = [];

  for (let i = 0; i < 100; i++) {
    const password = 'test1234';
    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nickname: faker.internet.userName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
        authProvider: 'email',
        password: hashedPassword,
        isGuest: false,
      },
    });

    users.push(user);

    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 10000 + Math.random() * 5000,
      },
    });
  }

  // 🟦 종목 생성
  const existingStocks = await prisma.stock.findMany();
  if (existingStocks.length === 0) {
    await prisma.stock.createMany({
      data: [
        { symbol: 'AAPL', name: '애플', price: 190.25 },
        { symbol: 'TSLA', name: '테슬라', price: 720.0 },
        { symbol: 'NVDA', name: '엔비디아', price: 1050.3 },
      ],
    });
  }

  const stocks = await prisma.stock.findMany();

  // 🟧 가격 히스토리 생성
  for (const stock of stocks) {
    await prisma.stockHistory.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        stockId: stock.id,
        price: stock.price + (Math.random() - 0.5) * 20,
        timestamp: new Date(Date.now() - (10 - i) * 60_000),
      })),
    });
  }

  // 🟨 유저 보유 주식
  for (const user of users.slice(0, 50)) {
    const holdings = stocks.map((stock) => ({
      userId: user.id,
      stockId: stock.id,
      quantity: Math.floor(Math.random() * 10) + 1,
      avgBuyPrice: stock.price,
    }));

    await prisma.holding.createMany({ data: holdings });
  }

  // 🟥 거래 기록
  for (const user of users.slice(0, 30)) {
    for (const stock of stocks) {
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = stock.price + (Math.random() - 0.5) * 10;
      const total = quantity * price;

      await prisma.userTransaction.create({
        data: {
          userId: user.id,
          stockId: stock.id,
          quantity,
          price,
          total,
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        },
      });
    }
  }

  // 🟦 친구 관계
  for (let i = 0; i < 50; i++) {
    const userA = users[i];
    const userB = users[i + 1];
    if (userA && userB) {
      await prisma.friend.createMany({
        data: [
          { userId: userA.id, friendId: userB.id },
          { userId: userB.id, friendId: userA.id },
        ],
      });
    }
  }

  // 🟪 친구 요청
  for (let i = 0; i < 20; i++) {
    const sender = users[i];
    const receiver = users[i + 2];
    if (sender && receiver) {
      await prisma.friendRequest.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          status: 'PENDING',
        },
      });
    }
  }

  console.log('✅ 더미 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('🚨 Seed 실패:', e);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
