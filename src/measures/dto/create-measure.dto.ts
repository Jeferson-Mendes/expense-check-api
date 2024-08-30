import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MeasureType } from '../entities/measure.entity';

export class CreateMeasureDto {
  image: Express.Multer.File;

  @IsString()
  @IsNotEmpty()
  customer_code: string;

  @IsDateString()
  @IsNotEmpty()
  measure_datetime: string;

  @IsEnum(MeasureType)
  measure_type: MeasureType;
}
