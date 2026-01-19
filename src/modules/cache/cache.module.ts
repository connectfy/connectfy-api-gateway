import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppCacheService } from '@modules/cache/cache.service';

@Global()
@Module({
  imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
  providers: [AppCacheService],
  exports: [AppCacheService, CacheModule],
})
export class AppCacheModule {}
