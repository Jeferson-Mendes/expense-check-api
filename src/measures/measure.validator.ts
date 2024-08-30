import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { Query } from 'express-serve-static-core';
import { extname } from 'path';
import { MeasureType } from './entities/measure.entity';

export function getFileValidator(): PipeTransform {
  return new ParseFilePipeDocument();
}

export function getMeasureTypeValidator(): PipeTransform {
  return new ValidMeasureType();
}

@Injectable()
export class ParseFilePipeDocument implements PipeTransform {
  private readonly alowedExtendions = [
    '.png',
    '.jpeg',
    '.jpg',
    '.webp',
    '.heic',
    '.heif',
  ];

  transform(value: Express.Multer.File): Express.Multer.File {
    if (!value) {
      throw new BadRequestException('Image should not be empty');
    }

    const extension = extname(value.originalname);
    if (!this.alowedExtendions.includes(extension)) {
      throw new BadRequestException(`File type ${extension} not supported`);
    }
    return value;
  }
}

@Injectable()
export class ValidMeasureType implements PipeTransform {
  transform(value: Query) {
    const measureType: string = value.measure_type as string;
    if (measureType) {
      const hasKey = Object.keys(MeasureType).includes(
        measureType.toUpperCase(),
      );

      if (!hasKey) {
        throw new HttpException(
          {
            error: 'INVALID_TYPE',
            message: 'Tipo de medição não permitida',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return value;
  }
}
