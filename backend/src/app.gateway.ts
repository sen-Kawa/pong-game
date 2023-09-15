import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { SocketService } from './socket/socket.service'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private socketService: SocketService) {}

  @WebSocketServer() public server: Server
  private logger: Logger = new Logger('AppGateWay')

  afterInit(server: Server) {
    this.socketService.socket = server
  }

  handleConnection(client: Socket, ...args: any[]) {
    args
    this.logger.log('Client connected ' + client.id)
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected ' + client.id)
  }
}
