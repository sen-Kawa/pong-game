import { faker } from '@faker-js/faker'
import { Match, Prisma } from '@prisma/client'
import { createFakeUser } from './user.test-data'

export function createFakeMatch(options?: {
  withPlayers?: boolean
  completed?: boolean
  maxScore?: number
}): Prisma.MatchCreateInput {
  const _maxScore = options?.maxScore ?? 999
  const fakePlayers: Prisma.PlayersOnMatchCreateNestedManyWithoutMatchInput = {
    create: [
      { player: { create: createFakeUser() }, score: faker.number.int(_maxScore) },
      { player: { create: createFakeUser() }, score: faker.number.int(_maxScore) }
    ]
  }

  return {
    start: faker.date.past(),
    end: options?.completed ? faker.date.recent() : null,
    players: fakePlayers
  }
}

export const minimalMatch = {
  id: 1,
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
