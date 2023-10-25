import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { StatisticsService } from './statistics.service'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

@Controller('statistics')
@ApiTags('statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Req() req: any): Promise<any> {
    //return this.statisticsService.getPlayerCount()
    const numberOfPlayers: number = await this.statisticsService.getPlayerCount()
    const numberOfGames: number = await this.statisticsService.getUserGamesCount(req.user.id)
    const wins: number = await this.statisticsService.getWinCount(req.user.id)
    const losses: number = await this.statisticsService.getLossesCount(req.user.id)
    const position: number = await this.statisticsService.ladderPosition(req.user.displayName)
    return [
      {
        wins: `${wins}`,
        losses: `${losses}`,
        numberOfGames: `${numberOfGames}`,
        position: `${position}`,
        numberOfPlayers: `${numberOfPlayers}`
      }
    ]
  }

  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  async getLeaderboard(): Promise<any> {
    return (await this.statisticsService.generateLeaderboard()).slice(0, 10)
  }
}
