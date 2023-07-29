import { Injectable } from '@nestjs/common'
import { UpdateGameDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Match, Prisma } from '@prisma/client'

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MatchCreateInput): Promise<Match> {
    return this.prisma.match.create({ data })
  }

  findAll(includePlayers: boolean) {
    return this.prisma.match.findMany({
      include: { players: { include: { player: includePlayers } } }
    })
  }

  findOne(id: number) {
    return this.prisma.match.findUnique({ where: { id } })
  }

  // update(id: number, updateGameDto: UpdateGameDto) {
  //   return this.prisma.match.update({ where: { id }, data: updateGameDto })
  // }

  remove(id: number) {
    return this.prisma.match.delete({ where: { id } })
  }
}
