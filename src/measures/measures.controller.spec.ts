import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresController } from './measures.controller';
import { MeasuresService } from './measures.service';

describe('MeasuresController', () => {
  let controller: MeasuresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasuresController],
      providers: [MeasuresService],
    }).compile();

    controller = module.get<MeasuresController>(MeasuresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
