import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 더미 종목 생성
  const stocks = await prisma.stock.createMany({
    data: [
      { symbol: 'AAPL', name: '애플', price: 190.25 },
      { symbol: 'TSLA', name: '테슬라', price: 720.0 },
      { symbol: 'NVDA', name: '엔비디아', price: 1050.3 },
    ],
  });

  // 각 종목에 대한 history 생성
  const createdStocks = await prisma.stock.findMany();

  for (const stock of createdStocks) {
    await prisma.stockHistory.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        stockId: stock.id,
        price: stock.price + (Math.random() - 0.5) * 20, // 약간의 랜덤 오차
        timestamp: new Date(Date.now() - (10 - i) * 60_000), // 1분 간격
      })),
    });
  }
}

main()
  .then(() => {
    console.log('🌱 Seed completed');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
