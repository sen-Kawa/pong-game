// nicer format
export interface MatchResult {
  id: number;
  completed: boolean;
  start: Date;
  end: Date;
  players: {
    id: number;
    score: number;
    name: string;
    email: string;
  }[];
}

// comes from the Prisma Client + the wire transfer (stringify)
export interface MatchDTO {
  id: number;
  completed: boolean;
  start: string;
  end: string;
  players: {
    playerId: number;
    matchId: number;
    score: number;
    player: {
      id: number;
      email: string;
      name: string;
    };
  }[];
}

export interface MatchMetaData {
  id: number;
  completed: boolean;
  start: Date;
  end: Date;
}
