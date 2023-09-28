import { Test, TestingModule } from '@nestjs/testing'
import { ChatsController } from './chats.controller'
import { ChatsService } from './chats.service'
import { PrismaService } from 'src/prisma/prisma.service'

describe('ChatsController', () => {
  let controller: ChatsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [PrismaService, ChatsService]
    }).compile()

    controller = module.get<ChatsController>(ChatsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
