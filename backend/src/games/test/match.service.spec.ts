import { Test, TestingModule } from '@nestjs/testing'
import { MatchService } from '../match.service'
import { PrismaService } from 'src/prisma/prisma.service'

const gameArray = [
  {
    id: 1,
    completed: true,
    start: new Date('2023-06-24T14:11:57.246Z'),
    end: new Date('2023-06-24T15:00:39.111Z'),
    players: [
      {
        playerId: 1,
        gameId: 1,
        score: 7
      },
      {
        playerId: 3,
        gameId: 1,
        score: 4
      }
    ]
  }
]

const uncompletedGame = {
  id: 1,
  completed: false,
  start: new Date('2023-06-24T14:11:57.246Z'),
  end: null,
  players: [
    {
      playerId: 1,
      gameId: 1
    },
    {
      playerId: 3,
      gameId: 1
    }
  ]
}

const playerOnGame = {
  playerId: 1,
  gameId: 1,
  score: 7
}

const oneGame = gameArray[0]

const gamesDb = {
  game: {
    findMany: jest.fn().mockResolvedValue(gameArray),
    findUnique: jest.fn().mockResolvedValue(oneGame),
    findFirst: jest.fn().mockResolvedValue(oneGame),
    create: jest.fn().mockReturnValue(oneGame),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(oneGame),
    delete: jest.fn().mockResolvedValue(oneGame)
  },

  playersOnGame: {
    update: jest.fn().mockResolvedValue(playerOnGame)
  }
}

describe('GamesService', () => {
  let service: MatchService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchService, { provide: PrismaService, useValue: gamesDb }]
    }).compile()

    service = module.get<MatchService>(MatchService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
