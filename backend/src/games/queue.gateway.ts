import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server } from 'http'
import { MatchService } from './match.service'
import { QueueService } from './queue.service'
import { SocketService } from 'src/socket/socket.service'
import { UsersService } from '../users/users.service'

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_URL],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
export class QueueGateway {
  constructor(
    private queueService: QueueService,
    private matchService: MatchService,
    private socketService: SocketService,
    private usersService: UsersService
  ) {}

  @WebSocketServer() private server: Server
  private logger: Logger = new Logger('MatchGateWay')

  @SubscribeMessage('joinQueue')
  joinQueue(@ConnectedSocket() client: any) {
    const userId = client.data.userId
    this.queueService.addPlayer(userId)
    this.logger.log(`User ${userId} joined the queue`)
    this.usersService.setUserStatus(userId, 'INQUEUE')
    if (this.queueService.queue.length > 1) {
      this.createMatch()
    }
  }

  @SubscribeMessage('leaveQueue')
  leaveQueue(@ConnectedSocket() client: any) {
    const userId = client.data.userId
    this.queueService.removePlayer(userId)
    this.logger.log(`User ${userId} left the queue`)
    this.usersService.setUserStatus(userId, 'ONLINE')
  }

  async createMatch() {
    const player1 = this.queueService.queue.shift()
    const player2 = this.queueService.queue.shift()

    try {
      const match = await this.matchService.create({
        players: {
          create: [{ playerId: player1 }, { playerId: player2 }]
        }
      })
      this.logger.log(`created new match ${match.id} for players ${player1} and ${player2}`)
      //this.matchService.createQueueGame(match.id, player1, player2)
      const playerOne = this.socketService.getSocketId(player1)
      const playerTwo = this.socketService.getSocketId(player2)
      this.socketService.socket.to(playerOne).emit('newGame', match.id)
      this.socketService.socket.to(playerTwo).emit('newGame', match.id)
      // send player name to update game info
      this.socketService.socket.to(playerOne).emit('player_one_name', match.players[1].player.name)
    } catch (error) {
      this.logger.warn(`Error while creating match: ${error}`)
    }
  }
}
