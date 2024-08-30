import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
  Get,
  Query,
  Param,
  UseFilters,
} from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { getFileValidator, getMeasureTypeValidator } from './measure.validator';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { HttpExceptionFilter } from 'src/utils/http-exception.filter';

@Controller('measures')
export class MeasuresController {
  constructor(private readonly measuresService: MeasuresService) {}

  @Post('/upload')
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createMeasureDto: CreateMeasureDto,
    @UploadedFile(getFileValidator()) image: Express.Multer.File,
  ) {
    return this.measuresService.create({ ...createMeasureDto, image });
  }

  @Patch('/confirm')
  @UseFilters(new HttpExceptionFilter())
  update(@Body() confirmMeasureDto: ConfirmMeasureDto) {
    return this.measuresService.confirm(confirmMeasureDto);
  }

  @Get('/:customer_code/list')
  @UseFilters(new HttpExceptionFilter())
  listCustomerMeasures(
    @Param('customer_code') customer_code: string,
    @Query(getMeasureTypeValidator()) query: ExpressQuery,
  ) {
    return this.measuresService.findByCustomerCode(customer_code, query);
  }
}
