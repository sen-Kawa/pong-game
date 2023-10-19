export interface Player {
    pos: number;
    vector: number;
}

export interface Ball {
    xPos: number;
    yPos: number;
    xVec: number;
    yVec: number;
}

export interface GameUpdate {
    player: Player;
    ball: Ball;
    gameid: number;
    scores: [number, number];
}
