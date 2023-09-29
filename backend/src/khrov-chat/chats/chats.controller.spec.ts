import { Test, TestingModule } from '@nestjs/testing'
import { ChatsController } from './chats.controller'
import { ChatsService } from './chats.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ChatsGateway } from './chats.gateway'
import { SocketService } from '../../socket/socket.service'

describe('ChatsController', () => {
  let controller: ChatsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [PrismaService, ChatsService, ChatsGateway, SocketService]
    }).compile()

    controller = module.get<ChatsController>(ChatsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
