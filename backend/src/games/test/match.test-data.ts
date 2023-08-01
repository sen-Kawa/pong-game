export const minimalMatch = {
  id: 1,
  completed: true,
  start: new Date('2023-06-24T14:11:57.246Z'),
  end: new Date('2023-06-24T15:00:39.111Z')
}

export const minimalUncompletedMatch = { ...minimalMatch, completed: false }
export const matchWithScore = {
  ...minimalMatch,
  players: [
    {
      playerId: 1,
      matchId: 1,
      score: 7
    },
    {
      playerId: 2,
      matchId: 1,
      score: 4
    }
  ]
}
export const maximalMatch = {
  ...minimalMatch,
  players: [
    {
      playerId: 1,
      matchId: 1,
      score: 7,
      player: {
        id: 1,
        name: 'Alice'
      }
    },
    {
      playerId: 2,
      matchId: 1,
      score: 4,
      player: {
        id: 2,
        name: 'Bob'
      }
    }
  ]
}
export const matchWithOnePlayer = {
  ...minimalMatch,
  players: [
    {
      playerId: 1,
      matchId: 1
    }
  ]
}
export const matchWithTwoPlayers = {
  ...minimalMatch,
  players: [
    {
      playerId: 1,
      matchId: 1
    },
    {
      playerId: 2,
      matchId: 1
    }
  ]
}

export const minimalMatchArray = [{ ...minimalMatch }]
export const matchWithScoreArray = [{ ...matchWithScore }]
export const maximalMatchArray = [{ ...maximalMatch }]
