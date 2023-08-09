import { Test, TestingModule } from '@nestjs/testing'
import { MatchController } from '../match.controller'
import { MatchService } from '../match.service'
import { UsersModule } from 'src/users/users.module'

const oneMatch = {
  id: 1,
  completed: true,
  start: new Date('2023-06-24T14:11:57.246Z'),
  end: new Date('2023-06-24T15:00:39.111Z'),
  players: [
    {
      playerId: 1,
      matchId: 1,
      score: 7
    },
    {
      playerId: 3,
      matchId: 1,
      score: 4
    }
  ]
}

const mockMatchService = {
  create: jest.fn().mockResolvedValue(oneMatch)
}

describe('MatchController', () => {
  let controller: MatchController
  let service: MatchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
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
})
