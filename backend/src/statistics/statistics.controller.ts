import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { UserEntity } from 'src/users/entities/user.entity'
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Controller('statistics')
@ApiTags('statistics')
export class StatisticsController {

    constructor(private statisticsService: StatisticsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getStatistics(@Req() req: any): Promise<any> {
        //return this.statisticsService.getPlayerCount()
        let numberOfPlayers: number  =  await this.statisticsService.getPlayerCount()
        let numberOfGames: number = await this.statisticsService.getUserGamesCount(req.user.id)
        let wins: number = await this.statisticsService.getWinCount(req.user.id)
        let losses: number = await this.statisticsService.getLossesCount(req.user.id)
        let position: number = await this.statisticsService.ladderPosition(req.user.id)
        return [{wins: `${wins}`, losses: `${losses}`,numberOfGames: `${numberOfGames}`, position: `${position}`, numberOfPlayers: `${numberOfPlayers}`}]
    }

    @Get('leaderboard')
    @UseGuards(JwtAuthGuard)
    async getLeaderboard(@Req() req: any): Promise<any> {
        // return await this.statisticsService.generateLeaderboard()
        return 'leaderboard'
    }
}
