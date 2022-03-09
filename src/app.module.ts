import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/jwt-auth.guard';
import { FileModule } from './file/file.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserController } from './user/user.controller';
import { FileController } from './file/file.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionModule } from 'nestjs-session';
import * as RedisStore from 'connect-redis';
import * as session from 'express-session';
import { RedisService } from './common/redis/redis.service';
import { RedisModule } from './common/redis/redis.module';

const Redistore = RedisStore(session);

@Module({
  imports: [
    UserModule,
    FileModule,
    SessionModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: async (configService: ConfigService, redisService: RedisService) => {
        return {
          session: {
            cookie: {
              maxAge: 180000,
            },
            resave: false,
            saveUninitialized: false,
            secret: configService.get<string>('SECRET_KEY'),
            store: new Redistore({ client: redisService.client() }),
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AppController, UserController, FileController);
  }
}
