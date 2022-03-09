import { HttpException, InternalServerErrorException, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { UserModule } from 'src/user/user.module';
import { FetchMiddleware } from './middleware/fetch.middleware';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdir, stat } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [
    UserModule,
    MulterModule.registerAsync({
      useFactory: () => ({
        limits: {
          fileSize: 209715200,
        },
        storage: diskStorage({
          destination: (req, file, callback) => {
            try {
              // console.log(req.user['id']);
              // console.log(req.body.folder);
              const dir =
                req.params.folder != null || req.params.folder != undefined
                  ? join(__dirname, `../../storage/${req.user['id']}`, `${req.params.folder}`)
                  : join(__dirname, `../../storage/${req.user['id']}`);
              stat(dir, (err, stats) => {
                if (err) {
                  return mkdir(dir, { recursive: true }, (err) => callback(err, dir));
                }
                if (stats.isDirectory()) {
                  return callback(err, dir);
                }
              });
            } catch (error) {
              throw new InternalServerErrorException();
            }
          },
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = file.mimetype.split('/')[1];
            callback(null, `${uniqueSuffix}.${ext}`);
          },
        }),
      }),
    }),
  ],
  controllers: [FileController],
  providers: [FileService, PrismaService],
})
export class FileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchMiddleware).forRoutes({
      path: 'file/fetch/:offset',
      method: RequestMethod.GET,
    });
  }
}
