import { Injectable } from '@nestjs/common';
import { CACHE_KEYS, CLS_KEYS } from 'connectfy-shared';
import { CacheService } from '@/src/app-settings/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: CacheService,
    private readonly cls: ClsService,
  ) {}

  async get() {
    const user = await this.cls.get(CLS_KEYS.USER);
    const cacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.NOTIFICATION(user._id);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) return cached;

    const res = await this.tcpConnectionService.account({
      endpoint: 'notification-settings/get',
    });

    if (res) {
      await this.cacheService.set(cacheKey, res);
    }

    return res;
  }

  async update(data: any) {
    const res = await this.tcpConnectionService.account({
      endpoint: 'notification-settings/update',
      payload: data,
    });

    if (res.userId) {
      const cacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.NOTIFICATION(res.userId);
      const cached = await this.cacheService.get<
        Record<string, any> | undefined
      >(cacheKey);

      if (cached) {
        await this.cacheService.updatePreserveTtl(cacheKey, res);
      }
    }

    return res;
  }
}
