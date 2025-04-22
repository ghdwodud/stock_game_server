/*
  Warnings:

  - Added the required column `updatedAt` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "changeRate" DOUBLE PRECISION,
ADD COLUMN     "prevPrice" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "StockHistory" (
    "id" SERIAL NOT NULL,
    "stockId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
