import { Injectable } from '@nestjs/common';
import { notNull } from 'jest-mock-extended';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
    constructor(private prisma: PrismaService) {}

    async getPlayerCount(): Promise<Number> {
        return await this.prisma.user.count({
        })
    }

    async getUserGamesCount(userid: number): Promise<Number> {
        let numberOfGames = await this.prisma.playersOnMatch.count({
            // add right id + check for ongoing games + divide by 2
            where: {
                playerId: 5 // userid,
            }  
        })
        return numberOfGames
    }

    // yet to do
    async getWinCount() {
        return await this.prisma.playersOnMatch.count({
          where: {
            playerId: 5
          },
        })
    }

    // yet to do
    async getLossesCount() {
        return await this.prisma.playersOnMatch.count({
          where: {
            playerId: 5
          },
        })
    }
    // yet to do
    async ladderPosition() {
        return await this.prisma.playersOnMatch.count({
          where: {
            playerId: 5
          },
        })
    }
}
