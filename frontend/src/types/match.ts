// nicer format
export interface MatchMetaData {
  id: number
  start?: Date
  end?: Date
  players: PlayerOnMatch[]
}

// comes from the Prisma Client + the wire transfer (stringify)
export interface MatchDTO {
  id: number
  start: string
  end: string
  players:
    | {
        playerId: number
        matchId: number
        score: number
        player: PlayerOnMatch
      }[]
    | undefined
}

export interface PlayerOnMatch {
  id: number
  score: number
  name: string
  email: string
}
