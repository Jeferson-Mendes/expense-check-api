import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'path';

export function getFileValidator(): PipeTransform {
  return new ParseFilePipeDocument();
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
      throw new BadRequestException('image should not be empty');
    }

    const extension = extname(value.originalname);
    if (!this.alowedExtendions.includes(extension)) {
      throw new BadRequestException(`File type ${extension} not supported`);
    }
    return value;
  }
}
