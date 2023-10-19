import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Logger } from '@nestjs/common'
import { MatchService } from './match.service'
import { GameUpdate } from 'common-types'

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:8080',
      'https://sturdy-halibut-5px7jx47ggwh79vw-8080.app.github.dev'
    ],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
export class MatchGateway {
  constructor(
    private matchService: MatchService
  ) {}

  @WebSocketServer() public server: Server

  private logger: Logger = new Logger('MatchGateway')

  @SubscribeMessage('move')
  game_update(@MessageBody() update: GameUpdate, @ConnectedSocket() client: any) {
    this.matchService.makeMove(
      (update as any)[0],
      client.id,
      client.data.userId
    )
  }

  @SubscribeMessage('player_connected')
  player_connected(@ConnectedSocket() client: any, @MessageBody() update: GameUpdate) {
    console.log("Player connected: ")
    this.matchService.playerConnected(client.id, client.data.userId, (update as any)[0])
  }
}
