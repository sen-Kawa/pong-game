/*
  Warnings:

  - You are about to drop the column `loginType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `user42Name` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_user42Name_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "loginType",
DROP COLUMN "password",
DROP COLUMN "user42Name";

-- DropEnum
DROP TYPE "LOGIN_TYPE";
