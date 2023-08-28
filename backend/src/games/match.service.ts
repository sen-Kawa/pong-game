import { ConflictException, Injectable, UseGuards } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { MatchEntity } from './entities/match.entity'
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { Server } from 'http'

interface Player {
	pos: number,
	vector: number
}

export interface GameUpdate {
	players: Player[],
	tick: number,
	gameid: number
}

interface Client {
    id: number,
    connection_id: string
}

interface Game {
	players: {
        pos:Player,
        id: number,
        session_id: string
    }[]
}

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

  matches: Game[];

  async create(data: Prisma.MatchCreateInput) {
    const match = await this.prisma.match.create({ data, include: { players: { include: { player: true } } } })

    this.matches[match.id] = {
        players: [
            {
                pos: {
                    pos: 0,
                    vector: 0
                },
                id: 0,
                session_id: ""
            },
            {
                pos: {
                    pos: 0,
                    vector: 0
                },
                id: 0,
                session_id: ""
            }
        ]
    }

    return match
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
   * @param started if true searches for matches with a start date
   * @param completed if true searches for matches with an end date
   * @param players filter matches to only include matches with these players in it
   * @returns a list of all matches in detailed representation according to the query parameters
   */
  async findAll(options: {
    includeScores?: boolean
    includePlayers?: boolean
    started?: boolean
    completed?: boolean
    players?: number[]
  }): Promise<MatchEntity | unknown> {
    // TODO: add sorting and limit
    const { includeScores, includePlayers, started, completed, players } = options
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

    return this.prisma.match.findMany({
      include: includes,
      where: {
        start: started !== undefined ? (started ? { not: null } : null) : undefined,
        end: completed !== undefined ? (completed ? { not: null } : null) : undefined,
        players: playersOnMatchFilter
      }
    })
  }

  async findOne(
    id: number,
    options?: {
      includeScores?: boolean
      includePlayers?: boolean
    }
  ) {
    const { includeScores, includePlayers } = options
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

/**
 * Creates a random string of given length
 * @param length the lenth of the string
 * @returns The random string
 */
function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}