import { Test, TestingModule } from '@nestjs/testing'
import { MatchController } from '../match.controller'
import { MatchService } from '../match.service'

const minimalMatch = {
  id: 1,
  completed: true,
  start: new Date('2023-06-24T14:11:57.246Z'),
  end: new Date('2023-06-24T15:00:39.111Z')
}

const minimalUncompletedMatch = { ...minimalMatch, completed: false }
const matchWithScore = {
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
const maximalMatch = {
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
const matchWithOnePlayer = {
  ...minimalMatch,
  players: [
    {
      playerId: 1,
      matchId: 1
    }
  ]
}
const matchWithTwoPlayers = {
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

const minimalMatchArray = [{ ...minimalMatch }]
const matchWithScoreArray = [{ ...matchWithScore }]
const maximalMatchArray = [{ ...maximalMatch }]

const mockMatchService = {
  create: jest.fn().mockResolvedValue(matchWithScore),
  all: jest.fn().mockResolvedValue(minimalMatchArray),
  findAll: jest.fn(),
  findOne: jest.fn().mockResolvedValue(maximalMatch),
  remove: jest.fn(),
  addPlayer: jest.fn(),
  addMatchResult: jest.fn()
}

describe('MatchController', () => {
  let controller: MatchController
  let service: MatchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: mockMatchService
        }
      ]
    }).compile()

    controller = module.get<MatchController>(MatchController)
    service = module.get<MatchService>(MatchService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a match', async () => {
      await controller.create({
        playerIds: [54]
      })

      expect(service.create).toBeCalledTimes(1)
    })
  })

  describe('all', () => {
    it('should return all matches in minimal representation', async () => {
      const matches = await controller.findAll()

      expect(matches).toEqual(minimalMatchArray)
    })

    it('should return all matches with the score included', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(matchWithScoreArray)

      const matches = await controller.findAll(false)

      expect(matches).toEqual(matchWithScoreArray)
    })

    it('should return all matches with the score and player names included', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(maximalMatchArray)

      const matches = await controller.findAll(true)

      expect(matches).toEqual(maximalMatchArray)
    })
  })

  describe('findOne', () => {
    it('should return the match in detailed representation', async () => {
      const match = await controller.findOne(1)

      expect(match).toEqual(maximalMatch)
    })
  })

  describe('update', () => {
    it('should add a second player to an existing match', async () => {
      const match = await controller.update(1, { playerId: 2 })

      expect(service.addPlayer).toBeCalled()
      // expect(match).toEqual(matchWithTwoPlayers) // TODO: arrange test for that
    })

    it('should add the match result and mark the game as completed', async () => {
      const match = await controller.update(1, {
        scores: [
          {
            playerId: 1,
            score: 7
          }
        ]
      })

      expect(service.addMatchResult).toBeCalled()
      // expect(match).toEqual(matchWithScore) // TODO: arrange test for that
    })

    it('should add a second player and report the match results', async () => {
      const match = await controller.update(1, {
        playerId: 2,
        scores: [
          {
            playerId: 1,
            score: 7
          }
        ]
      })

      expect(service.addMatchResult).toBeCalled()
      expect(service.addPlayer).toBeCalled()
    })
  })
})
