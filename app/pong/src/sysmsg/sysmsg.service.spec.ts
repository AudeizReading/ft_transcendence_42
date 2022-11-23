import { Test, TestingModule } from '@nestjs/testing';
import { SysMsgService } from './sysmsg.service';

describe('SysMsgService', () => {
  let service: SysMsgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SysMsgService],
    }).compile();

    service = module.get<SysMsgService>(SysMsgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
