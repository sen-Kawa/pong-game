import { Module } from '@nestjs/common'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  controllers: [MatchController],
  providers: [MatchService],
  imports: [PrismaModule, UsersModule]
})
export class GamesModule {}
