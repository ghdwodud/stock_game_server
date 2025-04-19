-- CreateTable
CREATE TABLE "UserStock" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stockCode" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "UserStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserStock" ADD CONSTRAINT "UserStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
