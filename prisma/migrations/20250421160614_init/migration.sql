/*
  Warnings:

  - You are about to drop the column `userUuid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_userUuid_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userUuid",
ADD COLUMN     "uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
