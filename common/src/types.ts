export interface Player {
    pos: number;
    vector: number;
    player_token: string;
    id: number;
}

export interface GameUpdate {
    player: Player;
    gameid: number;
}
