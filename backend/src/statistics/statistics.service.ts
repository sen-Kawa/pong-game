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

    async getUserGamesCount(userid: number): Promise<number> {
        // console.log("UserId: ", userid)
        let result: Array<any> = await this.prisma.$queryRaw
        `SELECT  "matchId"
        FROM "PlayersOnMatch" 
        WHERE "playerId" = ${userid} AND
        "matchId" IN 
        (SELECT "id" FROM "Match" WHERE "end" IS NOT NULL)
        `
        // console.log("Games: ", result, result.length)
        return result.length



        // let numberOfGames = await this.prisma.playersOnMatch.count({
        //     // add right id + check for ongoing games + divide by 2
        //     where: {
        //         // for testing
        //         // playerId: 5
        //         playerId: userid
        //     }  
        // })
        // return numberOfGames
    }

    async getWinCount(userid: number) {
        // for testing id = 14
        // userid = 14
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
        // for testing id = 14
        // userid = 14
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
    async ladderPosition(userId: number) {
        // userId = 16
        let result: Array<any> = await this.prisma.$queryRaw
        `SELECT  p1."playerId", sum(p1."score")
        FROM "PlayersOnMatch" as p1 
        INNER JOIN "PlayersOnMatch" as p2 USING ("matchId")
        WHERE p1."playerId" != p2."playerId" AND 
        p1."matchId" IN 
        (SELECT "id" FROM "Match" WHERE "end" IS NOT NULL) AND
        p1."score" > p2."score"
        GROUP BY p1."playerId"
        ORDER BY sum(p1."score") DESC
        ` 
        // console.log("Leaderboard: ", result)
        
        const isUserId = (element: any) => element.playerId === userId
        console.log("Position: ", result.findIndex(isUserId))
        // TODO: check for -1 and for players who did not complete a game
        if (result.findIndex(isUserId) === -1)
            return -1
        return result.findIndex(isUserId) + 1  // as index starts with 0

    }

    async generateLeaderboard() {
        let result: Array<any> = await this.prisma.$queryRaw
        `SELECT  p1."playerId", sum(p1."score")
        FROM "PlayersOnMatch" as p1 
        INNER JOIN "PlayersOnMatch" as p2 USING ("matchId")
        WHERE p1."playerId" != p2."playerId" AND 
        p1."matchId" IN 
        (SELECT "id" FROM "Match" WHERE "end" IS NOT NULL) AND
        p1."score" > p2."score"
        GROUP BY p1."playerId"
        ORDER BY sum(p1."score") DESC
        ` 
        // console.log("Leaderboard: ", result)
        return result
    }
}
