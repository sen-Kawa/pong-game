import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'

@Injectable()
export class SocketService {
  public socket: Server = null
  private readonly connectedClients: Map<number, string[]> = new Map()
  getSocketId(userId: number) {
    return this.connectedClients.get(userId)
  }

  addClient(userId: number, socketId: string) {
    const tmp = this.connectedClients.get(userId)
    if (!tmp) this.connectedClients.set(userId, [socketId])
    else tmp.push(socketId)
  }
  removeClient(userId: number, socketId: string) {
    const tmp = this.connectedClients.get(userId)
    const index = tmp.indexOf(socketId)
    tmp.splice(index, 1)
    if (!tmp.length) return true
    else return false
  }
}
