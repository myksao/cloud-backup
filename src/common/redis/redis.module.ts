import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  providers: [ConfigService, RedisService],
  exports: [RedisService],
  imports: [ConfigModule, RedisModule],
})
export class RedisModule {}
