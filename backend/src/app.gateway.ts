import { Logger } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { parse } from 'cookie'
import { Server, Socket } from 'socket.io'
import { AppService } from './app.service'
import { AuthService } from './auth/auth.service'
import { SocketService } from './socket/socket.service'

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
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private appService: AppService
  ) {}

  @WebSocketServer() public server: Server
  private logger: Logger = new Logger('AppGateWay')

  afterInit(server: Server) {
    this.socketService.socket = server
  }

  async handleConnection(client: Socket, ...args: any[]) {
    if (!client.handshake.headers.cookie) client.disconnect()
    else {
      try {
        const { 'auth-cookie': token } = parse(client.handshake.headers.cookie)
        if (token) {
          const test = await this.authService.verifyJwt(token)
          if (!test) {
            this.server.emit('failed_con')
            return client.disconnect()
          }
          client.data.userId = test.userId
          this.appService.connectedUser(test.userId, client.id)
          args
          this.logger.log('Client connected ' + client.id)
        }
      } catch (error) {
        this.logger.warn(`Error while connecting client: ${error}`)
        client.disconnect()
      }
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.appService.disconnectedUser(client.data.userId, client.id)
      this.logger.log('Client disconnected ' + client.data.userId)
    } else this.logger.log('Unknown Client disconnected ' + client.id)
    client.disconnect()
  }
}
