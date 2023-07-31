/*
  Warnings:

  - A unique constraint covering the columns `[user42Name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_user42Name_key" ON "User"("user42Name");
