import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'

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

  async create(data: Prisma.MatchCreateInput) {
    return this.prisma.match.create({ data, include: { players: { include: { player: true } } } })
  }

  /**
   *
   * @returns a list of all matches in the minimal representation (no score and players)
   */
  async all() {
    return this.prisma.match.findMany()
  }

  /**
   *
   * @param options specifies what should be included and searched for
   * @param includePlayers controls the inclusion of user information
   * @param completed if true searches for matches with an end date
   * @returns a list of all matches in detailed representation according to the query parameters
   */
  async findAll(options: { includePlayers?: boolean; completed?: boolean }) {
    const { includePlayers, completed } = options
    return this.prisma.match.findMany({
      include: {
        players: {
          include: { player: includePlayers }
        }
      },
      where: {
        end: completed !== undefined ? (completed ? { not: null } : null) : undefined
      }
    })
  }

  async findOne(id: number): Promise<MatchWithPlayers> {
    return this.prisma.match.findUniqueOrThrow({
      include: { players: { include: { player: true } } },
      where: { id }
    })
  }

  // TODO: check if the player is already on the match
  async addPlayer(matchId: number, additionalPlayer: number) {
    // check if maxPlayersOnMatch already reached
    const currentPlayerCount = await this.prisma.playersOnMatch.count({
      where: { matchId: matchId }
    })

    if (currentPlayerCount != 1) throw new ConflictException('Cannot add player to match.')

    return this.prisma.match.update({
      include: { players: true },
      where: { id: matchId },
      data: {
        players: {
          connectOrCreate: {
            where: {
              playerId_matchId: {
                matchId: matchId,
                playerId: additionalPlayer
              }
            },
            create: {
              playerId: additionalPlayer
            }
          }
        }
      }
    })
  }

  async addMatchResult(matchId: number, scores: { playerId: number; score: number }[]) {
    const playersOnMatchData = scores.map((score) => ({
      ...score,
      matchId: matchId
    }))
    console.log(playersOnMatchData)
    return this.prisma.match.update({
      include: { players: true },
      where: { id: matchId },
      data: {
        end: new Date(),
        players: {
          deleteMany: { matchId: matchId },
          createMany: {
            data: scores
          }
        }
      }
    })
  }

  async remove(id: number) {
    return this.prisma.match.delete({ where: { id } })
  }
}
