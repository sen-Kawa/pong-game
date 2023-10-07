import { Logger, Req, UseGuards } from '@nestjs/common'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'http'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { MatchService } from './match.service'
import { QueueService } from './queue.service'

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_URL],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard)
export class QueueGateway {
  constructor(
    private queueService: QueueService,
    private matchService: MatchService
  ) {}

  @WebSocketServer() private server: Server
  private logger: Logger = new Logger('MatchGateWay')

  @SubscribeMessage('joinQueue')
  joinQueue(@Req() request: any) {
    console.debug({ request })
    this.queueService.addPlayer(request.user.id)
    this.logger.log(`User ${request.user.id} joined the queue`)
    this.server.emit('player_joined', request.user.id)
    this.logger.debug(this.queueService.queue)

    if (this.queueService.queue.length > 0) {
      this.createMatch()
    }
  }

  @SubscribeMessage('leaveQueue')
  leaveQueue(@Req() request: any) {
    this.queueService.removePlayer(request.user.id)
    this.logger.log(`User ${request.user.id} left the queue`)
    this.server.emit('player_left', request.user.id)
    this.logger.debug(this.queueService.queue)
  }

  async createMatch() {
    const player1 = this.queueService.queue.shift()
    const player2 = this.queueService.queue.shift()

    const match = await this.matchService.create({
      players: {
        create: [{ playerId: player1 }, { playerId: player2 }]
      }
    })

    this.server.emit('newGame', match.id)
  }
}
