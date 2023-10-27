/*
  Warnings:

  - You are about to drop the `UserAvatar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_avatarId_fkey";

-- DropTable
DROP TABLE "UserAvatar";
