import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'

const matchWithPlayers = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: { include: { player: true } } }
})
export type MatchWithPlayers = Prisma.MatchGetPayload<typeof matchWithPlayers>

const playersOnMatchWithUserInfo = Prisma.validator<Prisma.PlayersOnMatchArgs>()({
  include: { player: true }
})
export type PlayersOnMatchWithUserInfo = Prisma.PlayersOnMatchGetPayload<
  typeof playersOnMatchWithUserInfo
>

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MatchCreateInput) {
    return this.prisma.match.create({ data, include: { players: { include: { player: true } } } })
  }

  findAll(includePlayers: boolean) {
    return this.prisma.match.findMany({
      include: { players: { include: { player: includePlayers } } }
    })
  }

  findOne(id: number): Promise<MatchWithPlayers> {
    return this.prisma.match.findUniqueOrThrow({
      include: { players: { include: { player: true } } },
      where: { id }
    })
  }

  // update(id: number, updateGameDto: UpdateGameDto) {
  //   return this.prisma.match.update({ where: { id }, data: updateGameDto })
  // }

  remove(id: number) {
    return this.prisma.match.delete({ where: { id } })
  }
}
