import { Module } from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { MeasuresController } from './measures.controller';

@Module({
  controllers: [MeasuresController],
  providers: [MeasuresService],
})
export class MeasuresModule {}
