import { Injectable } from '@nestjs/common'

@Injectable()
export class QueueService {
  constructor() {
    this.queue = []
  }

  // queue: [playerId?: number]
  queue: number[]

  addPlayer(playerId: number): boolean {
    if (!this.queue.includes(playerId)) this.queue.push(playerId)

    // if (this.queue.length > 1) {
    //   createGame(this.queue.shift(), this.queue.shift())
    // }
    return true
  }

  // createGame(player1id: number, player2id: number) {

  // }

  removePlayer(playerId: number) {
    this.queue = this.queue.filter((player) => player != playerId)
  }
}
