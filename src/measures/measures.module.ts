import { Module } from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { MeasuresController } from './measures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measure } from './entities/measure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measure])],
  controllers: [MeasuresController],
  providers: [MeasuresService],
})
export class MeasuresModule {}
