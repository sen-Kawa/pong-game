export interface Player {
    pos: number;
    vector: number;
}

export interface GameUpdate {
    player: Player;
    gameid: number;
}
