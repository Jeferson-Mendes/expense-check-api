import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { GeminiApi } from '../services/gemini/gemini-api';
import { InjectRepository } from '@nestjs/typeorm';
import { Measure, MeasureType } from './entities/measure.entity';
import { Repository } from 'typeorm';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { Query } from 'express-serve-static-core';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectRepository(Measure) private measureRepo: Repository<Measure>,
  ) {}

  private async hasMeasureInCurrentMonth(input: {
    customerCode: string;
    measureType: MeasureType;
    measureDatetime: string;
  }): Promise<boolean> {
    const { customerCode, measureDatetime, measureType } = input;
    const date = new Date(measureDatetime);

    const startOfMonth = new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    ).getTime();
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime();

    const existingMeasure = await this.measureRepo
      .createQueryBuilder('measure')
      .where('measure.customer_code = :customerCode', { customerCode })
      .where('measure.measure_type = :measureType', { measureType })
      .andWhere('measure.measure_datetime >= :startOfMonth', { startOfMonth })
      .andWhere('measure.measure_datetime <= :endOfMonth', { endOfMonth })
      .getOne();

    return !!existingMeasure;
  }

  async create(createMeasureDto: CreateMeasureDto) {
    const { image, measure_type, customer_code, measure_datetime } =
      createMeasureDto;
    const geminiApi = new GeminiApi(process.env.GEMINI_API_KEY);

    if (
      await this.hasMeasureInCurrentMonth({
        customerCode: customer_code,
        measureDatetime: measure_datetime,
        measureType: measure_type,
      })
    ) {
      throw new ConflictException({
        error: 'DOUBLE_REPORT',
        message: 'Leitura do mês já realizada',
      });
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
      customer_code: createMeasureDto.customer_code,
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
      throw new NotFoundException({
        error: 'MEASURE_NOT_FOUND',
        message: 'Leitura do mês já realizada',
      });
    }
    if (record.has_confirmed) {
      throw new ConflictException({
        error: 'CONFIRMATION_DUPLICATE',
        message: 'Leitura do mês já realizada',
      });
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

  async findByCustomerCode(customer_code: string, query: Query) {
    let records: Measure[] = [];

    const measureType: string = query.measure_type as string;
    if (measureType) {
      records = await this.measureRepo.find({
        where: {
          customer_code,
          measure_type: MeasureType[measureType.toUpperCase() as MeasureType],
        },
      });
    } else {
      records = await this.measureRepo.find({
        where: { customer_code },
      });
    }

    if (!records.length) {
      throw new HttpException(
        {
          error: 'MEASURES_NOT_FOUND',
          message: 'Nenhuma leitura encontrada',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      customer_code: customer_code,
      measures: records.map((measure) => ({
        measure_uuid: measure.measure_uuid,
        measure_datetime: new Date(Number(measure.measure_datetime)),
        measure_type: measure.measure_type,
        has_confirmed: measure.has_confirmed,
        image_url: measure.image_url,
      })),
    };
  }
}
