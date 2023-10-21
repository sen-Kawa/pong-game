import { Module } from '@nestjs/common'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { MatchGateway } from './match.gateway'
import { UsersService } from 'src/users/users.service'

@Module({
  controllers: [MatchController],
  providers: [MatchService, MatchGateway, UsersService],
  imports: [PrismaModule]
})
export class GamesModule {}
