import { Test, TestingModule } from '@nestjs/testing'
import { MatchController } from '../match.controller'
import { MatchService } from '../match.service'
import { verify } from 'crypto'
import { UsersService } from 'src/users/users.service'

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

const minimalMatchArray = [{ ...minimalMatch }]
const matchWithScoreArray = [{ ...matchWithScore }]
const maximalMatchArray = [{ ...maximalMatch }]

const mockMatchService = {
  create: jest.fn().mockResolvedValue(matchWithScore),
  all: jest.fn().mockResolvedValue(minimalMatchArray),
  findAll: jest.fn(),
  findOne: jest.fn().mockResolvedValue(matchWithScore),
  remove: jest.fn()
}
// console.log(minimalMatch)
// console.log(minimalUncompletedMatch)
// console.log(matchWithScore)
console.log(maximalMatch)

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
})
