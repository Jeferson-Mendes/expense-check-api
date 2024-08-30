import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { ConfirmMeasureDto } from './dto/confirm-measure.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { getFileValidator } from './file.validator';

@Controller()
export class MeasuresController {
  constructor(private readonly measuresService: MeasuresService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createMeasureDto: CreateMeasureDto,
    @UploadedFile(getFileValidator()) image: Express.Multer.File,
  ) {
    return this.measuresService.create({ ...createMeasureDto, image });
  }

  @Patch('/confirm')
  update(@Body() confirmMeasureDto: ConfirmMeasureDto) {
    return this.measuresService.confirm(confirmMeasureDto);
  }
}
