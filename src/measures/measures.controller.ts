import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
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

  // @Get()
  // findAll() {
  //   return this.measuresService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.measuresService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMeasureDto: UpdateMeasureDto) {
  //   return this.measuresService.update(+id, updateMeasureDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.measuresService.remove(+id);
  // }
}
