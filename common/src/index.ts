export const paddleWidth = 15
export const paddleHeight = 70
export const ballRadius = 8
export const fieldWidth = 600
export const fieldHeight = 450
export interface Player {
    pos: number
    vector: number
}

export interface Ball {
    xPos: number
    yPos: number
    xVec: number
    yVec: number
}

export interface GameUpdate {
    players: {
      0: Player
      1: Player
    }
    ball: {
            xPos: number
            yPos: number
            xVec: number
            yVec: number
    }
    score: [number, number],
    paused: boolean
}
