/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_friends` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LOGIN_TYPE" AS ENUM ('LOCAL', 'FORTY_TWO');

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_playerOneName_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_playerTwoName_fkey";

-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_friends" DROP CONSTRAINT "_friends_B_fkey";

-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loginType" "LOGIN_TYPE" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "userName" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "_friends";

-- CreateTable
CREATE TABLE "PlayersOnMatch" (
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayersOnMatch_pkey" PRIMARY KEY ("playerId","matchId")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "completed" BOOLEAN DEFAULT false,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFriend" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserFriend_AB_unique" ON "_UserFriend"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFriend_B_index" ON "_UserFriend"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- AddForeignKey
ALTER TABLE "PlayersOnMatch" ADD CONSTRAINT "PlayersOnMatch_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersOnMatch" ADD CONSTRAINT "PlayersOnMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFriend" ADD CONSTRAINT "_UserFriend_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFriend" ADD CONSTRAINT "_UserFriend_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
