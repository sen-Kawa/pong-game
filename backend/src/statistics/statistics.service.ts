import { Injectable } from '@nestjs/common';
import { notNull } from 'jest-mock-extended';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
    constructor(private prisma: PrismaService) {}

    async getPlayerCount(): Promise<number> {
        return await this.prisma.user.count({
        })
    }

    async getUserGamesCount(userid: number): Promise<number> {
        console.log("UserId: ", userid)
        let numberOfGames = await this.prisma.playersOnMatch.count({
            // add right id + check for ongoing games + divide by 2
            where: {
                // for testing
                playerId: 5
                //playerId: userid // userid,
            }  
        })
        return numberOfGames
    }

    // Template for query results

    // `SELECT "matchId", p1."playerId" as "playerId1", p1."score" as "score1", p2."playerId" as "playerId2", p2."score" as "score2"
    //     FROM "PlayersOnMatch" as p1 
    //     INNER JOIN "PlayersOnMatch" as p2 USING ("matchId")
    //     WHERE p1."playerId" != p2."playerId" AND 
    //     p1."matchId" IN 
    //     (SELECT "id" FROM "Match" WHERE "end" IS NOT NULL) AND
    //     p1."playerId" = ${userid} AND
    //     p1."score" > p2."score"
    //  `

    async getWinCount(userid: number) {
        // for testing id = 13
        // userid = 13
        let result: Array<any> = await this.prisma.$queryRaw
        `SELECT  "matchId", p1."playerId" as "playerId1", p1."score" as "score1", p2."playerId" as "playerId2", p2."score" as "score2"
        FROM "PlayersOnMatch" as p1 
        INNER JOIN "PlayersOnMatch" as p2 USING ("matchId")
        WHERE p1."playerId" != p2."playerId" AND 
        p1."matchId" IN 
        (SELECT "id" FROM "Match" WHERE "end" IS NOT NULL) AND
        p1."playerId" = ${userid} AND
        p1."score" > p2."score"
        `
        // console.log("Wins: ", result, result.length)
        return result.length
        
    }

    async getLossesCount(userid: number) {
        // for testing id = 13
        // userid = 13
        let result: Array<any> = await this.prisma.$queryRaw
        `SELECT  "matchId", p1."playerId" as "playerId1", p1."score" as "score1", p2."playerId" as "playerId2", p2."score" as "score2"
        FROM "PlayersOnMatch" as p1 
        INNER JOIN "PlayersOnMatch" as p2 USING ("matchId")
        WHERE p1."playerId" != p2."playerId" AND 
        p1."matchId" IN 
        (SELECT "id" FROM "Match" WHERE "end" IS NOT NULL) AND
        p1."playerId" = ${userid} AND
        p1."score" < p2."score"
        `
        // console.log("Losses: ", result, result.length)
        return result.length
    }
    // yet to do
    async ladderPosition(id: number) {
        return await this.prisma.playersOnMatch.count({
          where: {
            playerId: id
          },
        })
    }
}
