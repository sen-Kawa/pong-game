import { Test, TestingModule } from '@nestjs/testing'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { PrismaService } from 'src/prisma/prisma.service'

describe('ChatsService', () => {
  let service: ChatsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ChatsService],
      controllers: [ChatsController]
    }).compile()

    service = module.get<ChatsService>(ChatsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
