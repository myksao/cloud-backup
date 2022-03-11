import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(LoggerMiddleware.name);
  }
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug({
      path: req.route.path,
      Request: {
        param: req.params,
        query: req.query,
        body: req.body,
      },
    });
    next();
  }
}
