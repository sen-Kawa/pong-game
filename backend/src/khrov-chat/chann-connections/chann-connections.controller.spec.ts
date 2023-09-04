import { Test, TestingModule } from '@nestjs/testing';
import { ChannConnectionsController } from './chann-connections.controller';

describe('ChannConnectionsController', () => {
  let controller: ChannConnectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannConnectionsController],
    }).compile();

    controller = module.get<ChannConnectionsController>(ChannConnectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
