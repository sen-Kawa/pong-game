import { Injectable, Logger } from '@nestjs/common'
import { SocketService } from './socket/socket.service'
import { UsersService } from './users/users.service'

@Injectable()
export class AppService {
  constructor(
    private socketService: SocketService,
    private userService: UsersService
  ) {}

  private logger: Logger = new Logger('AppService')

  async connectedUser(userId: number, socketId: string) {
    const user = await this.userService.findOne(userId)
    if (!user) return
    try {
      this.socketService.addClient(userId, socketId)
      this.userService.setUserStatus(userId, 'ONLINE')
    } catch (error) {
      this.logger.warn(`Error while adding client: ${error}`)
    }
  }

  async disconnectedUser(userId: number, socketId: string) {
    const user = await this.userService.findOne(userId)
    if (!user) return
    try {
      if (this.socketService.removeClient(userId, socketId))
        this.userService.setUserStatus(userId, 'OFFLINE')
    } catch (error) {
      this.logger.warn(`Error while removing client: ${error}`)
    }
  }
}
