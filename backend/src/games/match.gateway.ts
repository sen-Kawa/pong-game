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
//import { GameUpdate } from 'common-types'

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
  constructor(private matchService: MatchService) {}

  @WebSocketServer() public server: Server

  private logger: Logger = new Logger('MatchGateway')

  @SubscribeMessage('move_up')
  move_up(@MessageBody() gameid: number, @ConnectedSocket() client: any) {
    this.matchService.makeMove(client.data.userId, -4, gameid[0])
  }

  @SubscribeMessage('move_down')
  move_down(@MessageBody() gameid: number, @ConnectedSocket() client: any) {
    this.matchService.makeMove(client.data.userId, 4, gameid[0])
  }

  @SubscribeMessage('stop')
  stop(@MessageBody() gameid: number, @ConnectedSocket() client: any) {
    this.matchService.makeMove(client.data.userId, 0, gameid[0])
  }

  @SubscribeMessage('player_connected')
  async player_connected(@ConnectedSocket() client: any, @MessageBody() payload: any) {
    await this.matchService.playerConnected(client.id, client.data.userId, (payload as any)[0])
  }
}
