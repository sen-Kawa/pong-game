import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
// import prisma from 'src/prisma/__mocks__/prisma'

import { StatisticsService } from './statistics.service'

describe('StatisticsService', () => {
  let service: StatisticsService

  jest.mock('src/prisma/prisma.service')

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, StatisticsService]
    }).compile()

    service = module.get<StatisticsService>(StatisticsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
