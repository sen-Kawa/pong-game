import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { MatchController } from './match.controller'
import { MatchGateway } from './match.gateway'
import { MatchService } from './match.service'
import { QueueGateway } from './queue.gateway'
import { QueueService } from './queue.service'

@Module({
  controllers: [MatchController],
  providers: [MatchService, MatchGateway, QueueService, QueueGateway],
  imports: [PrismaModule]
})
export class GamesModule {}
