import { Test, TestingModule } from '@nestjs/testing';
import { ChannConnectionsService } from './chann-connections.service';

describe('ChannConnectionsService', () => {
  let service: ChannConnectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannConnectionsService],
    }).compile();

    service = module.get<ChannConnectionsService>(ChannConnectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
