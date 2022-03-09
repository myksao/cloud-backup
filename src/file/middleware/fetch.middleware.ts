import { BadRequestException, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class FetchMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(FetchMiddleware.name);
  }
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(req.params['offset']);
    const offset: number = req.params['offset'] as unknown as number;
    if (offset < 0) {
      throw new BadRequestException();
    }
    next();
  }
}
