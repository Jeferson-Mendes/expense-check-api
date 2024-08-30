import { IsDateString, IsEnum, IsString } from 'class-validator';
import { MeasureType } from '../entities/measure.entity';

export class CreateMeasureDto {
  image: Express.Multer.File;

  @IsString()
  customer_code: string;

  @IsDateString()
  measure_datetime: string;

  @IsEnum(MeasureType)
  measure_type: MeasureType;
}
