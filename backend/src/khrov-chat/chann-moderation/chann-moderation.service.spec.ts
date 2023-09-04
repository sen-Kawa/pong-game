import { Test, TestingModule } from '@nestjs/testing';
import { ChannModerationService } from './chann-moderation.service';

describe('ChannModerationService', () => {
  let service: ChannModerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannModerationService],
    }).compile();

    service = module.get<ChannModerationService>(ChannModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
