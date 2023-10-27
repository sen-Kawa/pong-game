import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GameStatus } from './dto/query-match.dto'
import { MatchEntity } from './entities/match.entity'
import { UsersService } from '../users/users.service'
import {
  Player,
  GameUpdate,
  paddleHeight,
  paddleWidth,
  ballRadius,
  fieldHeight,
  fieldWidth
} from 'common-types'
import { SocketService } from 'src/socket/socket.service'

enum GameState {
  Created,
  Running,
  Paused
}

interface Game {
  players: {
    0: {
      player: Player
      id: number
      connected: boolean
    }
    1: {
      player: Player
      id: number
      connected: boolean
    }
  }
  ball: {
    xPos: number
    yPos: number
    xVec: number
    yVec: number
  }
  score: [number, number]
  state: GameState
  gameid: number
  last_modified: Date
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

const MAXBOUNCEANGLE = (75 * Math.PI) / 180
const BALLSPEED = 8

@Injectable()
export class MatchService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService,
    private usersService: UsersService
  ) {
    this.matches = new Map<number, Game>()
    setInterval(() => {
      const remove: number[] = []
      this.matches.forEach(async (game, key) => {
        const diff = Date.now() - game.last_modified.getTime()
        if (diff > 1000 * 30) {
          console.log('Match timed out')
          remove.push(key)
          await this.matchEnd(game)
        }
      })
      remove.map((key) => {
        this.matches.delete(key)
      })
    }, 1000 * 60)
    setInterval(() => {
      this.gameTick()
    }, 1000 / 60)
  }

  matches: Map<number, Game>

  isInMatch(userId: number) {
    let matchId = undefined
    for (const [id, match] of this.matches) {
      if (userId === match.players[0].id || userId === match.players[1].id) {
        matchId = id
        break
      }
    }
    return matchId
  }

  async join(matchId: number, playerId: number) {
    const match = this.matches.get(matchId)
    // const match = this.matches[matchId]
    if (match === undefined) {
      console.log('Match is undefined')
      return undefined
    }

    if (match.players[0].id != playerId && match.players[1].id === undefined) {
      match.players[1].id = playerId
      await this.addPlayer(matchId, playerId)
    }

    const db_match = await this.findOne(matchId, {
      includePlayers: true,
      includeScores: true
    })

    return db_match
  }

  private async matchEnd(game: Game) {
    console.log(game.gameid)
    if (game.players[1].id !== undefined) {
      await this.addMatchResult(game.gameid, [
        {
          playerId: game.players[0].id,
          score: game.score[0]
        },
        {
          playerId: game.players[1].id,
          score: game.score[1]
        }
      ])
      if (game.score[0] > game.score[1])
        this.usersService.updateWinLosses(game.players[0].id, game.players[1].id)
      else if (game.score[1] > game.score[0])
        this.usersService.updateWinLosses(game.players[1].id, game.players[0].id)
    }

    this.socketService.socket
      .to(this.socketService.getSocketId(game.players[0].id))
      .emit('match_end')
    this.socketService.socket
      .to(this.socketService.getSocketId(game.players[1].id))
      .emit('match_end')
    this.matches.delete(game.gameid)
  }

  private bounceBallLeft(game: Game) {
    const ball = game.ball
    const player = game.players[0].player
    const intersect = player.pos - ball.yPos
    const normalized = intersect / paddleHeight
    const bounceAngle = -normalized * MAXBOUNCEANGLE + Math.PI
    ball.xVec = -BALLSPEED * Math.cos(bounceAngle)
    ball.yVec = BALLSPEED * -Math.sin(bounceAngle)
  }

  private bounceBallRight(game: Game) {
    const ball = game.ball
    const player = game.players[1].player
    const intersect = player.pos - ball.yPos
    const normalized = intersect / paddleHeight
    const bounceAngle = -normalized * MAXBOUNCEANGLE - Math.PI
    ball.xVec = BALLSPEED * Math.cos(bounceAngle)
    ball.yVec = BALLSPEED * -Math.sin(bounceAngle)
  }

  gameTick() {
    this.matches.forEach(async (game) => {
      if (game.state == GameState.Created) {
        return
      }

      const playerOne = this.socketService.getSocketId(game.players[0].id)
      const playerTwo = this.socketService.getSocketId(game.players[1].id)
      if (playerOne.length === 0 || playerTwo.length === 0 || game.state == GameState.Paused) {
        const update: GameUpdate = {
          players: {
            0: game.players[0].player,
            1: game.players[1].player
          },
          ball: game.ball,
          score: game.score as [number, number],
          paused: true
        }
        game.state = GameState.Paused
        this.socketService.socket.to(playerOne).emit('game_update', update)
        this.socketService.socket.to(playerTwo).emit('game_update', update)
        return
      }

      const state = game

      // bounce paddle left player and check for point
      if (
        state.ball.xPos <= 0 + paddleWidth &&
        state.ball.yPos <= state.players[0].player.pos + paddleHeight / 2 &&
        state.ball.yPos >= state.players[0].player.pos - paddleHeight / 2
      ) {
        state.ball.xPos = 0 + paddleWidth + ballRadius + 1

        if (state.ball.xVec < 0) {
          this.bounceBallLeft(game)
        }
      } else if (state.ball.xPos <= 0 && state.ball.xVec < 0) {
        const angle = Math.random() * MAXBOUNCEANGLE + Math.PI
        state.ball.xVec = -BALLSPEED * Math.cos(angle)
        state.ball.yVec = BALLSPEED * -Math.sin(angle)
        state.score[1] += 1
        if (state.score[1] >= 11) {
          this.matchEnd(game)
        }
        state.ball.xPos = ballRadius + paddleWidth + 1
        state.ball.yPos = state.players[0].player.pos
      }

      // bounce paddle right player and check for point
      if (
        state.ball.xPos >= fieldWidth - paddleWidth &&
        state.ball.yPos <= state.players[1].player.pos + paddleHeight / 2 &&
        state.ball.yPos >= state.players[1].player.pos - paddleHeight / 2
      ) {
        state.ball.xPos = fieldWidth - paddleWidth - 1

        if (state.ball.xVec > 0) {
          this.bounceBallRight(game)
        }
      } else if (state.ball.xPos >= fieldWidth && state.ball.xVec > 0) {
        const angle = Math.random() * MAXBOUNCEANGLE - Math.PI
        state.ball.xVec = -BALLSPEED * Math.cos(angle)
        state.ball.yVec = BALLSPEED * -Math.sin(angle)
        state.score[0] += 1
        if (state.score[0] >= 11) {
          this.matchEnd(game)
        }
        state.ball.xPos = fieldWidth - ballRadius - paddleWidth - 1
        state.ball.yPos = state.players[1].player.pos
      }

      // bounce upper or lower wall

      if (state.ball.yPos - ballRadius <= 0) {
        state.ball.yVec = state.ball.yVec * -1
      }

      if (state.ball.yPos + ballRadius >= fieldHeight) {
        state.ball.yVec = state.ball.yVec * -1
      }

      // update ball position
      state.ball.xPos += state.ball.xVec
      state.ball.yPos += state.ball.yVec

      state.players[0].player.pos += state.players[0].player.vector
      if (state.players[0].player.pos <= 0 + paddleHeight / 2)
        state.players[0].player.pos = 0 + paddleHeight / 2
      if (state.players[0].player.pos >= fieldHeight - paddleHeight / 2)
        state.players[0].player.pos = fieldHeight - paddleHeight / 2

      state.players[1].player.pos += state.players[1].player.vector
      if (state.players[1].player.pos <= 0 + paddleHeight / 2)
        state.players[1].player.pos = 0 + paddleHeight / 2
      if (state.players[1].player.pos >= fieldHeight - paddleHeight / 2)
        state.players[1].player.pos = fieldHeight - paddleHeight / 2

      const update: GameUpdate = {
        players: {
          0: state.players[0].player,
          1: state.players[1].player
        },
        ball: state.ball,
        score: state.score as [number, number],
        paused: false
      }

      this.socketService.socket.to(playerOne).emit('game_update', update)
      this.socketService.socket.to(playerTwo).emit('game_update', update)
    })
  }

  async create(data: Prisma.MatchCreateInput) {
    console.debug({ data })
    const match = await this.prisma.match.create({
      data,
      include: { players: { include: { player: true } } }
    })
    const players = match.players

    const playerTwoId = match.players.length == 2 ? players[1].playerId : undefined

    this.matches.set(match.id, {
      players: [
        {
          player: {
            pos: 0,
            vector: 0
          },
          id: players[0].playerId,
          connected: false
        },
        {
          player: {
            pos: 0,
            vector: 0
          },
          id: playerTwoId,
          connected: false
        }
      ],
      ball: {
        xPos: 100,
        yPos: 100,
        xVec: 2,
        yVec: 0
      },
      score: [0, 0],
      state: GameState.Created,
      gameid: match.id,
      last_modified: new Date()
    })
    return match
  }

  async playerConnected(connection: string, userId: number, gameid: number) {
    const match = this.matches.get(gameid)
    if (!match) {
      console.log('Match not found')
      return undefined
    }

    let other_player = []
    if (match.players[0].id === userId) {
      match.players[0].connected = true
      other_player = this.socketService.getSocketId(match.players[1].id)
      match.last_modified = new Date()
    } else if (match.players[1].id === userId) {
      match.players[1].connected = true
      other_player = this.socketService.getSocketId(match.players[0].id)
      match.last_modified = new Date()
    }

    if (match.players[0].connected && match.players[1].connected) {
      const update: GameUpdate = {
        players: {
          0: match.players[0].player,
          1: match.players[1].player
        },
        ball: match.ball,
        score: match.score as [number, number],
        paused: false
      }

      if (match.state == GameState.Created) {
        await this.start(gameid)
      }

      this.socketService.socket.to(connection).emit('start_game', update)
      this.socketService.socket.to(other_player).emit('start_game', update)
      match.state = GameState.Running
    }
  }

  makeMove(userId: number, newVector: number, gameid: number) {
    const match = this.matches.get(gameid)
    if (!match) {
      return undefined
    }
    switch (userId) {
      case match.players[0].id:
        match.players[0].player.vector = newVector
        match.last_modified = new Date()
        break
      case match.players[1].id:
        match.players[1].player.vector = newVector
        match.last_modified = new Date()
        break
    }
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
        filter.start = null
        break
      case GameStatus.IN_PROGRESS:
        filter.start = {
          not: null
        }
        filter.end = null
        break
      case GameStatus.COMPLETED:
        filter.start = {
          not: null
        }
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
      where: filter,
      orderBy: {
        id: 'desc'
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
        start: new Date()
      }
    })
  }

  async addMatchResult(matchId: number, scores: { playerId: number; score: number }[]) {
    if (scores.length != 2) throw new ConflictException('Cannot add match result.')
    try {
      console.log(scores)
      console.log('in addMatchResult')
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
    } catch (error) {
      console.log(error)
    }
  }

  async remove(id: number) {
    return this.prisma.match.delete({ where: { id } })
  }

  // createQueueGame(matchId: number, player1: number, player2: number)
  // {
  //   this.matches.set(matchId, {
  //     players: [
  //       {
  //         player: {
  //           pos: 0,
  //           vector: 0
  //         },
  //         id: player1,
  //         connected: false
  //       },
  //       {
  //         player: {
  //           pos: 0,
  //           vector: 0
  //         },
  //         id: player2,
  //         connected: false
  //       }
  //     ],
  //     ball: {
  //       xPos: 100,
  //       yPos: 100,
  //       xVec: 1.5,
  //       yVec: -1.5
  //     },
  //     score: [0, 0],
  //     started: false,
  //     gameid: matchId,
  //     last_modified: new Date()
  //   })
  // }
}

// /**
//  * Creates a random string of given length
//  * @param length the lenth of the string
//  * @returns The random string
//  */
// function makeid(length: number) {
//   let result = ''
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//   const charactersLength = characters.length
//   let counter = 0
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength))
//     counter += 1
//   }
//   return result
// }
