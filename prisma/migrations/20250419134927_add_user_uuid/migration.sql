/*
  Warnings:

  - A unique constraint covering the columns `[userUuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userUuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_userUuid_key" ON "User"("userUuid");
