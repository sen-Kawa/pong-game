import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets'
import { SocketService } from '../socket/socket.service'
import { Server } from 'socket.io'
import { Logger, Req, UseGuards } from '@nestjs/common'
import { MatchService } from './match.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { GameUpdate } from 'common-types'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard)
export class MatchGateway {
  constructor(
    private socketService: SocketService,
    private matchService: MatchService
  ) {}

  @WebSocketServer() public server: Server
  private logger: Logger = new Logger('MatchGatewxay')

  /**
   *
   * @param update
   */
  @SubscribeMessage('move')
  game_update(@Req() request: any, @MessageBody() update: GameUpdate) {
    const match = this.matchService.makeMove(update, request.user.refreshToken)
    console.log('Update in game_update:', update)
    this.socketService.socket.emit('game_update', match)
    console.log('Match is: ' + match)
  }
}
