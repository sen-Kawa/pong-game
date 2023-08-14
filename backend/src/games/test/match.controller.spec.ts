import { Test, TestingModule } from '@nestjs/testing'
import { MatchController } from '../match.controller'
import { MatchService } from '../match.service'
import {
  matchWithScore,
  matchWithScoreArray,
  maximalMatch,
  maximalMatchArray,
  minimalMatchArray
} from '../../../prisma/match.test-data'

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
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(minimalMatchArray)

      const matches = await controller.findAll({ includeScores: false, includePlayers: false })

      expect(matches).toEqual(minimalMatchArray)
    })

    it('should return all matches with the score included', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(matchWithScoreArray)

      const matches = await controller.findAll({
        includeScores: true,
        includePlayers: false,
        completed: true
      })

      expect(matches).toEqual(matchWithScoreArray)
    })

    it('should return all matches with the score and player names included', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(maximalMatchArray)

      const matches = await controller.findAll({
        includeScores: true,
        includePlayers: true,
        completed: true
      })

      expect(matches).toEqual(maximalMatchArray)
    })
  })

  describe('findOne', () => {
    it('should return the match in detailed representation', async () => {
      const match = await controller.findOne(1, { includeScores: true, includePlayers: true })

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
