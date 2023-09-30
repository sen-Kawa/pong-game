import { Injectable } from '@nestjs/common'
import { UsersService } from './users/users.service'

@Injectable()
export class AppService {
  constructor(private userService: UsersService) {}

  //TODO error handling if user not there
  async connectedUser(userId: number) {
    const user = await this.userService.findOne(userId)
    if (!user) return
    try {
      this.userService.setUserStatus(userId, 'ONLINE')
    } catch (error) {
      console.log(error)
    }
  }

  async disconnectedUser(userId: number) {
    const user = await this.userService.findOne(userId)
    if (!user) return
    try {
      this.userService.setUserStatus(userId, 'OFFLINE')
    } catch (error) {
      console.log(error)
    }
  }
}
