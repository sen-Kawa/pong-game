import { Test, TestingModule } from '@nestjs/testing'
import { ChannelsController } from './channels.controller'
import { ChannelsService } from './channels.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ChannelsGateway } from './channels.gateway'
import { SocketService } from '../../socket/socket.service'

describe('ChannelsController', () => {
  let controller: ChannelsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
      providers: [PrismaService, ChannelsService, ChannelsGateway, SocketService]
    }).compile()

    controller = module.get<ChannelsController>(ChannelsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
