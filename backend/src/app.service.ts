import { Injectable } from '@nestjs/common'
import { SocketService } from './socket/socket.service'
import { UsersService } from './users/users.service'

@Injectable()
export class AppService {
  constructor(
    private socketService: SocketService,
    private userService: UsersService
  ) {}

  //TODO error handling if user not there
  async connectedUser(userId: number, socketId: string) {
    const user = await this.userService.findOne(userId)
    if (!user) return
    try {
      this.socketService.addClient(userId, socketId)
      this.userService.setUserStatus(userId, 'ONLINE')
    } catch (error) {
      console.log(error)
    }
  }

  async disconnectedUser(userId: number, socketId: string) {
    const user = await this.userService.findOne(userId)
    if (!user) return
    try {
      if (this.socketService.removeClient(userId, socketId))
        this.userService.setUserStatus(userId, 'OFFLINE')
    } catch (error) {
      console.log(error)
    }
  }
}
