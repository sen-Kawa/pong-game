import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { SocketService } from '../../socket/socket.service'
import { Server } from 'socket.io'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard)
export class ChannelsGateway {
  constructor(private socketService: SocketService) {}

  @WebSocketServer()
  server: Server

  emitToAll(event: string, code: number) {
    this.server.emit(event, code)
  }
}
