import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresService } from './measures.service';

describe('MeasuresService', () => {
  let service: MeasuresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeasuresService],
    }).compile();

    service = module.get<MeasuresService>(MeasuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
