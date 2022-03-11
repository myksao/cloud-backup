import {
  Controller,
  Get,
  Post,
  Param,
  ParseArrayPipe,
  Query,
  UploadedFiles,
  Body,
  UseInterceptors,
  Req,
  Logger,
  ParseIntPipe,
  Res,
  HttpStatus,
  StreamableFile,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Public } from 'src/common/decorators/public.decorator';
import { Admin, Role } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guard/role.guard';
import { CreateFileDto } from './dto/create-file.dto';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  private logger: Logger;
  constructor(private readonly fileService: FileService) {
    this.logger = new Logger(FileController.name);
  }

  @Post('upload/:folder')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@Req() req, @UploadedFiles() files: Array<Express.Multer.File>, @Param('folder') folder: string) {
    const createFile: CreateFileDto[] = [];
    files.forEach((value) => {
      createFile.push({
        fileName: value.filename,
        location: folder ? `${req.user.id}` + '/' + `${folder}` : `${req.user.id}"/"`,
        type: value.mimetype,
        userEmail: req.user.email,
      });
    });
    const result = await this.fileService.upload(createFile);
    return {
      result: result,
    };
  }

  @Get('fetch/:offset')
  async fetch(@Req() req, @Param('offset', ParseIntPipe) offset: number) {
    const files = await this.fileService.fetch(req.user, offset);
    return files;
  }

  @Get('download/:file_id')
  async download(@Req() req, @Param('file_id') file_id: string, @Res() res: Response) {
    const file = await this.fileService.download(req.user, file_id);
    const result = join(__dirname, '../../storage', file.location, file.fileName);
    this.logger.debug(result);
    res.sendFile(result, (err) => {
      this.logger.debug(err);
    });
  }

  @Role(Admin)
  @UseGuards(RoleGuard)
  @Delete('flag')
  async flagFiles(@Req() req, @Body() fileIds: any, @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: string[]) {
    const result = fileIds.id ? await this.fileService.flagFiles(req.user, fileIds.id) : await this.fileService.flagFiles(req.user, ids);
    if (result === fileIds.id.length || result === ids.length) {
      return {
        message: `${result} Files deleted`,
      };
    }
    return {
      message: `${result} Files deleted`,
    };
  }

  @Get('stream/:file_id')
  async fileStreaming(@Req() req, @Param('file_id') file_id: string, @Res() res: Response) {
    const file = await this.fileService.fileStreaming(req.user, file_id);
    const filePath = join(__dirname, '../../storage', file.location, file.fileName);
    this.logger.debug(filePath);
    const stream = createReadStream(filePath);
    return new StreamableFile(stream);
  }
}
