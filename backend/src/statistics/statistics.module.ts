import { Module } from '@nestjs/common'
import { StatisticsController } from './statistics.controller'
import { StatisticsService } from './statistics.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  controllers: [StatisticsController],
  imports: [PrismaModule],
  providers: [StatisticsService]
})
export class StatisticsModule {}
