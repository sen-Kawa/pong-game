import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets'
import { SocketService } from '../socket/socket.service'
import { Server } from 'socket.io'
import { Logger, Req, UseGuards } from '@nestjs/common'
import { MatchService } from './match.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { GameUpdate } from 'common-types'
import { OnGatewayConnection } from '@nestjs/websockets'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard)
export class MatchGateway implements OnGatewayConnection {
  constructor(
    private socketService: SocketService,
    private matchService: MatchService
  ) {}

  @WebSocketServer() public server: Server

  private logger: Logger = new Logger('MatchGatewxay')

  handleConnection(client: any, ...args: any[]) {
  }

  /**
   *
   * @param update
   */
  @SubscribeMessage('move')
  game_update(@MessageBody() update: GameUpdate, @ConnectedSocket() client: any) {
    const game_update = this.matchService.makeMove((update as any)[0], client.user.refreshToken, client.id)
  }
}
