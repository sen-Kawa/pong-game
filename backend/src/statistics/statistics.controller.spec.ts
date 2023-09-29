import { Test, TestingModule } from '@nestjs/testing'
import { StatisticsController } from './statistics.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { StatisticsService } from './statistics.service'

describe('StatisticsController', () => {
  let controller: StatisticsController
  //   let service: StatisticsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [StatisticsController],
      providers: [StatisticsService]
    }).compile()

    controller = module.get<StatisticsController>(StatisticsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
