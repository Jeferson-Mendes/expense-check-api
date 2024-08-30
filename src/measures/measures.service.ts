import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { GeminiApi } from '../services/gemini/gemini-api';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure, MeasureType } from './entities/measure.entity';
import { Between, Repository } from 'typeorm';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';

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

    if (await this.hasMeasureInCurrentMonth(measure_type)) {
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

    const processedImageNumberResponse = Number(processedImageTextResponse);

    const measure = this.measureRepo.create({
      image_url: uploadFileResponse.file.uri,
      measure_datetime: new Date(createMeasureDto.measure_datetime).getTime(),
      measure_type: createMeasureDto.measure_type,
      measure_value: processedImageNumberResponse,
    });

    const measureRecord = await this.measureRepo.save(measure);

    return {
      image_url: uploadFileResponse.file.uri,
      measure_value: processedImageNumberResponse,
      measure_uuid: measureRecord.measure_uuid,
    };
  }

  async confirm(confirmMeasureDto: ConfirmMeasureDto) {
    const { measure_uuid, confirmed_value } = confirmMeasureDto;
    const record = await this.measureRepo.findOne({ where: { measure_uuid } });

    if (!record) {
      throw new NotFoundException('Leitura do mês já realizada');
    }
    if (record.has_confirmed) {
      throw new ConflictException('Leitura do mês já realizada');
    }

    try {
      await this.measureRepo.update(
        { measure_uuid },
        { measure_value: confirmed_value, has_confirmed: true },
      );

      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Erro de servidor');
    }
  }
}
