import { CACHE_MANAGER, ConflictException, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Cache } from 'cache-manager';
import { BcryptService } from 'src/common/bcrypt/bcrypt.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private bcrypt: BcryptService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    this.logger = new Logger(UserService.name);
  }

  async create(createUserDto: CreateUserDto): Promise<User | null> {
    try {
      createUserDto.password = await this.bcrypt.hashPassword(createUserDto.password);
      const user = await this.prisma.user.create({
        data: createUserDto as Prisma.UserCreateInput,
      });
      return user;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException('Email already exist');
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    try {
      const cachedUser: any = JSON.parse(await this.cacheManager.get(loginDto.email));
      this.logger.log(cachedUser);
      if (!cachedUser) {
        const user = await this.prisma.user.findFirst({
          where: {
            email: loginDto.email,
          },
        });
        this.logger.log(user);
        const match = await this.bcrypt.comparePassword(loginDto.password, user.password);
        if (!match) {
          return null;
        }
        const res = await this.cacheManager.set(loginDto.email, JSON.stringify(user));
        if (res) {
          return user;
        }
      }
      const match = await this.bcrypt.comparePassword(loginDto.password, cachedUser.password);
      if (!match) {
        return null;
      }
      return cachedUser as User;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException('Email already exist');
          default:
            throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      throw new HttpException('Unable to perform operation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user: any): Promise<any | null> {
    const payload = { email: user.email, sub: user.uuid, role: user.role };
    return {
      message: `Hi ${user.name}`,
      token: this.jwtService.sign(payload, {
        expiresIn: '30m', //'1h',
      }),
    };
  }
}
