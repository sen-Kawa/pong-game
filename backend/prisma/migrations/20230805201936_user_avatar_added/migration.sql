-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "UserAvatar" (
    "id" SERIAL NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "filename" TEXT NOT NULL,

    CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatar_filename_key" ON "UserAvatar"("filename");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "UserAvatar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
