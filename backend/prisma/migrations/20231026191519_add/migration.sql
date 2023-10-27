-- DropForeignKey
ALTER TABLE "PlayersOnMatch" DROP CONSTRAINT "PlayersOnMatch_matchId_fkey";

-- AddForeignKey
ALTER TABLE "PlayersOnMatch" ADD CONSTRAINT "PlayersOnMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
