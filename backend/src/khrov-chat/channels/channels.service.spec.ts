import { Test, TestingModule } from '@nestjs/testing'
import { ChannelsService } from './channels.service'
import { PrismaService } from 'src/prisma/prisma.service'

describe('ChannelsService', () => {
  let service: ChannelsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ChannelsService]
    }).compile()

    service = module.get<ChannelsService>(ChannelsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
