import { Test, TestingModule } from '@nestjs/testing';
import { SysMsgController } from './sysmsg.controller';

describe('SysMsgController', () => {
  let controller: SysMsgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SysMsgController],
    }).compile();

    controller = module.get<SysMsgController>(SysMsgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
