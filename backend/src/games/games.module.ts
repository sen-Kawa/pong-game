import { Module } from '@nestjs/common'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { MatchGateway } from './match.gateway'

@Module({
  controllers: [MatchController],
  providers: [MatchService, MatchGateway],
  imports: [PrismaModule]
})
export class GamesModule {}
