import { Global, Module } from '@nestjs/common';
import { TcpConnectionModule } from './tcp-connections/tcp-connection.module';
import { RedisModule } from './redis/redis.module';
import { CacheModule } from './cache/cache.module';

@Global()
@Module({
  imports: [TcpConnectionModule, RedisModule, CacheModule],
  controllers: [],
  providers: [],
  exports: [TcpConnectionModule, RedisModule, CacheModule],
})
export class AppSettingsModule {}
