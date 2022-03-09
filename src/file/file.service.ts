import { ConflictException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { File, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { unlink } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileService {
  private logger: Logger;
  constructor(private prisma: PrismaService) {
    this.logger = new Logger(FileService.name);
  }

  async upload(createFile: CreateFileDto[]): Promise<number | null> {
    try {
      this.logger.debug(createFile);
      const files = await this.prisma.file.createMany({
        data: createFile as Prisma.FileCreateManyInput[],
      });
      return files.count;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fetch(user: any, offset: number): Promise<File[] | null> {
    try {
      const result =
        user.role === 'admin'
          ? await this.prisma.file.findMany({
              take: 10,
              skip: offset,
            })
          : await this.prisma.file.findMany({
              take: 10,
              skip: offset,
              where: {
                userEmail: user.email,
              },
            });
      return result;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download(user: any, file_id: string): Promise<File | null> {
    try {
      const file = await this.prisma.file.findUnique({
        where: {
          uuid: file_id,
        },
      });
      return file;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async flagFiles(user: any, ids: string[]): Promise<number | null> {
    try {
      const count = await this.prisma.$transaction(async (prisma) => {
        const files = await prisma.file.findMany({
          where: {
            uuid: {
              in: ids,
            },
            userEmail: user.email,
          },
        });

        files.forEach((file) => {
          const path = join(__dirname, '../../storage', file.location, file.fileName);
          this.logger.debug(path);
          unlink(path, (err) => {
            if (err) throw new HttpException(err.message, HttpStatus.FORBIDDEN);
            this.logger.debug(`${file.fileName} was deleted`);
          });
        });

        const filesCount = await prisma.file.deleteMany({
          where: {
            uuid: {
              in: ids,
            },
            userEmail: user.email,
          },
        });
        return filesCount.count;
      });
      return count;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fileStreaming(user: any, fileid: string): Promise<File | null> {
    try {
      const file = await this.prisma.file.findFirst({
        where: {
          uuid: fileid,
          userEmail: user.email,
        },
      });
      return file;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
