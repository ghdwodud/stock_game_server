/*
  Warnings:

  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "balance";

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 10000;
