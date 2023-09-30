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
import { parse } from 'cookie'
import { AuthService } from './auth/auth.service'
import { AppService } from './app.service'

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8080'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private socketService: SocketService,
    // private authService: AuthService,
    // private appService: AppService
  ) {}

  @WebSocketServer() public server: Server
  private logger: Logger = new Logger('AppGateWay')

  afterInit(server: Server) {
    this.socketService.socket = server
  }

  async handleConnection(client: Socket, ...args: any[]) {
    //TODO error handling
    // if (!client.handshake.headers.cookie) client.disconnect()
    // else {
    //   try {
    //     const { 'auth-cookie': token } = parse(client.handshake.headers.cookie)
    //     if (token) {
    //       // const test = await this.authService.verifyJwt(token)
    //       // console.log(test)
    //       if (!test) return client.disconnect()
    //       // this.appService.connectedUser(test.userId)
    //       args
    //       this.logger.log('Client connected ' + client.id)
    //     }
    //   } catch (error) {
    //     client.disconnect()
    //     console.log(error)
    //   }
    // }
  }

  async handleDisconnect(client: Socket) {
    //TODO error handling
    // try {
    //   const { 'auth-cookie': token } = parse(client.handshake.headers.cookie)
    //   if (token) {
    //     // const test = await this.authService.verifyJwt(token)
    //     // this.appService.disconnectedUser(test.userId)
    //     this.logger.log('Client disconnected ' + client.id)
    //   }
    // } catch (error) {
    //   console.log(error)
    // }
  }
}
