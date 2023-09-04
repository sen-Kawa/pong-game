/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Profile_pic" (
    "userId" INTEGER NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',

    CONSTRAINT "Profile_pic_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Chat_union" (
    "unionId" SERIAL NOT NULL,
    "unionIdOther" INTEGER NOT NULL,
    "client1Id" INTEGER NOT NULL,
    "client2Id" INTEGER NOT NULL,
    "blockStatus" BOOLEAN NOT NULL DEFAULT false,
    "allowedToUnblock" BOOLEAN NOT NULL DEFAULT false,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_union_pkey" PRIMARY KEY ("unionId")
);

-- CreateTable
CREATE TABLE "Chat_history" (
    "id" SERIAL NOT NULL,
    "unionId" INTEGER NOT NULL,
    "outgoing" TEXT,
    "incoming" TEXT,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryStatus" VARCHAR(16) NOT NULL DEFAULT 'sent',

    CONSTRAINT "Chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "desc" VARCHAR(128) NOT NULL,
    "visibility" VARCHAR(16) NOT NULL,
    "password" VARCHAR(128),

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel_link" (
    "id" SERIAL NOT NULL,
    "chId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" VARCHAR(16) NOT NULL,
    "linkStatus" VARCHAR(16) NOT NULL,
    "mutedUntil" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel_history" (
    "id" SERIAL NOT NULL,
    "chId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "outgoing" TEXT NOT NULL,
    "deliveryStatus" VARCHAR(8) NOT NULL DEFAULT 'sent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel_pending" (
    "id" SERIAL NOT NULL,
    "chId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Channel_historyToChannel_link" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_Channel_historyToChannel_link_AB_unique" ON "_Channel_historyToChannel_link"("A", "B");

-- CreateIndex
CREATE INDEX "_Channel_historyToChannel_link_B_index" ON "_Channel_historyToChannel_link"("B");

-- AddForeignKey
ALTER TABLE "Profile_pic" ADD CONSTRAINT "Profile_pic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_union" ADD CONSTRAINT "Chat_union_client1Id_fkey" FOREIGN KEY ("client1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_union" ADD CONSTRAINT "Chat_union_client2Id_fkey" FOREIGN KEY ("client2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_history" ADD CONSTRAINT "Chat_history_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "Chat_union"("unionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_link" ADD CONSTRAINT "Channel_link_chId_fkey" FOREIGN KEY ("chId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_link" ADD CONSTRAINT "Channel_link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_history" ADD CONSTRAINT "Channel_history_chId_fkey" FOREIGN KEY ("chId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_history" ADD CONSTRAINT "Channel_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_pending" ADD CONSTRAINT "Channel_pending_chId_fkey" FOREIGN KEY ("chId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel_pending" ADD CONSTRAINT "Channel_pending_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Channel_historyToChannel_link" ADD CONSTRAINT "_Channel_historyToChannel_link_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Channel_historyToChannel_link" ADD CONSTRAINT "_Channel_historyToChannel_link_B_fkey" FOREIGN KEY ("B") REFERENCES "Channel_link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
