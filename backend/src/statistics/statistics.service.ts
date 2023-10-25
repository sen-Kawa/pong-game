import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getPlayerCount(): Promise<number> {
    return await this.prisma.user.count({})
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
    let result = await this.getWinCount(userid)
    result += await this.getLossesCount(userid)
    return result
  }

  async getWinCount(userid: number) {
    const result = await this.prisma.user.findUnique({
      where: {
        id: userid
      },
      select: {
        wins: true
      }
    })
    return result.wins
  }

  async getLossesCount(userid: number) {
    const result = await this.prisma.user.findUnique({
      where: {
        id: userid
      },
      select: {
        losses: true
      }
    })
    return result.losses
  }

  async ladderPosition(displayName: string) {
    const leaderboard = await this.generateLeaderboard()
    for (const item of leaderboard) {
      if (item.displayName == displayName) return item.rank
    }
    return -1
  }

  async generateLeaderboard() {
    const tmp: Array<any> = await this.prisma.$queryRaw`SELECT "displayName",
    RANK () OVER (ORDER BY ratio DESC) AS rank,
    ratio
    FROM "User"
        `
    const result: Array<any> = []
    tmp.forEach((item) => {
      result.push({
        displayName: item.displayName,
        rank: Number(item.rank),
        ratio: item.ratio
      })
    })
    return result
  }
}
