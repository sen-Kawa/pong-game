import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GameStatus } from './dto/query-match.dto'
import { MatchEntity } from './entities/match.entity'

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
   * Finds all matches according to filters and includes additional data.
   * @param options specifies what should be included and searched for
   * @param includeScores controls the inclusion of score information
   * @param includePlayers controls the inclusion of user information
   * @param status filter matches based on their current status {@link GameStatus}
   * @param players filter matches to only include matches with these players in it
   * @returns a list of all matches in detailed representation according to the query parameters
   */
  async findAll(options: {
    includeScores?: boolean
    includePlayers?: boolean
    gameStatus?: GameStatus
    players?: number[]
  }): Promise<MatchEntity | unknown> {
    // TODO: add sorting and limit
    const { includeScores, includePlayers, gameStatus, players } = options
    console.debug({ options })

    const playersOnMatchFilter =
      players?.length > 1
        ? { every: { playerId: { in: players } } }
        : { some: { playerId: { in: players } } }

    let includes = { players: undefined }
    if (includeScores) includes = { players: true }
    if (includePlayers) {
      includes = { players: { include: { player: true } } }
    }

    const filter: Prisma.MatchWhereInput = {
      start: undefined,
      end: undefined,
      players: playersOnMatchFilter
    }
    switch (gameStatus) {
      case GameStatus.CREATED:
        break
      case GameStatus.IN_PROGRESS:
        filter.start = {
          not: null
        }
        break
      case GameStatus.COMPLETED:
        filter.end = {
          not: null
        }
        break
      default:
        if (gameStatus) console.debug(`GameStatus ${gameStatus} not valid!`)
        break
    }

    return this.prisma.match.findMany({
      include: includes,
      where: filter
    })
  }

  async findOne(
    id: number,
    options?: {
      includeScores?: boolean
      includePlayers?: boolean
    }
  ) {
    const { includeScores, includePlayers } = options || {}
    let includes = { players: undefined }
    if (includeScores) includes = { players: true }
    if (includePlayers) {
      includes = { players: { include: { player: true } } }
    }

    return this.prisma.match.findUniqueOrThrow({
      include: includes,
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

  async start(matchId: number) {
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        start: new Date(Date.now())
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
