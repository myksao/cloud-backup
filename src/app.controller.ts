import { Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get(':id')
  getHello(@Param('id') id: ParseIntPipe, @Query('device') device) {
    //throw new HttpException('Forbidden ', HttpStatus.FORBIDDEN);
    return {
      id: id,
      device: device,
    };
    //return this.appService.getHello();
  }
}
