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
    players: {
        0: Player;
        1: Player;
    };
    ball: {
        xPos: number;
        yPos: number;
        xVec: number;
        yVec: number;
    };
    score: [number, number];
    paused: boolean;
}
