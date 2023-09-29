import { Test, TestingModule } from '@nestjs/testing'
import { ChatsService } from './chats.service'
import { ChatsController } from './chats.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { ChatsGateway } from './chats.gateway'
import { SocketService } from '../../socket/socket.service'

describe('ChatsService', () => {
  let service: ChatsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ChatsService, ChatsGateway, SocketService],
      controllers: [ChatsController]
    }).compile()

    service = module.get<ChatsService>(ChatsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
