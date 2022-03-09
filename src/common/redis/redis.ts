import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;
export class Redis {
  protected readonly redisClient: RedisClient;
  private readonly logger: Logger;
  constructor(configService: ConfigService) {
    this.logger = new Logger(Redis.name);
    this.logger.debug(configService.get<string>('REDIS_URL'));
    this.redisClient = createClient({
      url: configService.get<string>('REDIS_URL'),
      legacyMode: true,
    });
  }

  client(): RedisClient {
    return this.redisClient;
  }

  connect() {
    this.redisClient.connect().catch((err) => {
      this.logger.error(err);
    });
  }

  disconnect() {
    this.redisClient.disconnect();
  }
}
