import { Injectable } from '@nestjs/common'
import { UpdateGameDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Match, Prisma } from '@prisma/client'

const matchWithScore = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: true }
})
export type MatchWithScore = Prisma.MatchGetPayload<typeof matchWithScore>

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

  create(data: Prisma.MatchCreateInput) {
    return this.prisma.match.create({ data, include: { players: { include: { player: true } } } })
  }

  /**
   *
   * @returns a list of all matches in the minimal representation (no score and players)
   */
  all() {
    return this.prisma.match.findMany()
  }

  /**
   *
   * @param includePlayers controls the inclusion of user information
   * @returns a list of all matches in detailed representation
   */
  findAll(includePlayers: boolean) {
    const playerInfoDepth = includePlayers ? true : { include: { player: true } }
    return this.prisma.match.findMany({
      include: { players: playerInfoDepth }
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
