import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets'
import { SocketService } from '../socket/socket.service'
import { Server } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { MatchService } from './match.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
// import { GameUpdate } from 'common-types'
import { OnGatewayConnection } from '@nestjs/websockets'

export interface Player {
    pos: number;
    vector: number;
}

export interface GameUpdate {
    player: Player;
    gameid: number;
}

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
  game_update(@MessageBody() update: GameUpdate, @ConnectedSocket() client: any) {
    this.matchService.makeMove(
      (update as any)[0],
      client.user.refreshToken,
      client.id
    )
  }

  @SubscribeMessage('move2')
  game_update2(@MessageBody() update: GameUpdate, @ConnectedSocket() client: any) {
    this.server.emit("game_update2", update)
    console.log("Got move 0: ", update)
    const game_update = this.matchService.makeMove((update as any)[0], client.user.refreshToken, client.id)
    console.log("Got move: ", update)
  }
}
