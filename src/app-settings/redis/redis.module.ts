import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { REDIS_KEYS } from 'connectfy-shared';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_KEYS.REDIS_CLIENT,
      useFactory: () => {
        const redis = new Redis({
          host: ENVIRONMENT_VARIABLES.REDIS_HOST,
          port: Number(ENVIRONMENT_VARIABLES.REDIS_PORT),
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis error:', err);
        });

        return redis;
      },
    },
  ],
  exports: [REDIS_KEYS.REDIS_CLIENT],
})
export class RedisModule {}
