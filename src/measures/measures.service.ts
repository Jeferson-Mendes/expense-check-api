import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMeasureDto } from './dto/create-measure.dto';
// import { UpdateMeasureDto } from './dto/update-measure.dto';
import { GeminiApi } from '../services/gemini/gemini-api';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure, MeasureType } from './entities/measure.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectRepository(Measure) private measureRepo: Repository<Measure>,
  ) {}

  private async hasMeasureInCurrentMonth(
    measureType: MeasureType,
  ): Promise<boolean> {
    const now = Date.now();

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).getTime();

    const existingMeasure = await this.measureRepo.findOne({
      where: {
        measure_type: measureType,
        measure_datetime: Between(startOfMonth, now),
      },
    });

    return !!existingMeasure;
  }

  async create(createMeasureDto: CreateMeasureDto) {
    const { image, measure_type } = createMeasureDto;
    const geminiApi = new GeminiApi(process.env.GEMINI_API_KEY);

    if (this.hasMeasureInCurrentMonth(measure_type)) {
      throw new ConflictException('Leitura do mês já realizada');
    }

    const uploadFileResponse = await geminiApi.uploadFile({
      fileBuffer: image.buffer,
      mimeType: image.mimetype,
      originalname: image.originalname,
    });

    const processedImageTextResponse = await geminiApi.processImage({
      fileUri: uploadFileResponse.file.uri,
      mimeType: uploadFileResponse.file.mimeType,
    });

    const measure = this.measureRepo.create({
      image_url: uploadFileResponse.file.uri,
      measure_datetime: new Date(createMeasureDto.measure_datetime).getTime(),
      measure_type: createMeasureDto.measure_type,
      measure_value: Number(processedImageTextResponse),
    });

    const measureRecord = await this.measureRepo.save(measure);

    return {
      image_url: uploadFileResponse.file.uri,
      measure_value: processedImageTextResponse,
      measure_uuid: measureRecord.measure_uuid,
    };
  }

  // findAll() {
  //   return `This action returns all measures`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} measure`;
  // }

  // update(id: number, updateMeasureDto: UpdateMeasureDto) {
  //   return `This action updates a #${id} measure`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} measure`;
  // }
}
