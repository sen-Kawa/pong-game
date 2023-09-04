import { Test, TestingModule } from '@nestjs/testing';
import { ChannModerationController } from './chann-moderation.controller';

describe('ChannModerationController', () => {
  let controller: ChannModerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannModerationController],
    }).compile();

    controller = module.get<ChannModerationController>(ChannModerationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
