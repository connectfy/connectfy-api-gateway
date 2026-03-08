import { Injectable } from '@nestjs/common';
import { CACHE_KEYS, CLS_KEYS } from 'connectfy-shared';
import { CacheService } from '@/src/app-settings/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class GeneralSettingsService {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: CacheService,
    private readonly cls: ClsService,
  ) {}

  async get() {
    const user = await this.cls.get(CLS_KEYS.USER);
    const cacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.GENERAL(user._id);
    const cached = await this.cacheService.get<Record<string, any> | undefined>(
      cacheKey,
    );

    if (cached) return cached;

    const res = await this.tcpConnectionService.account({
      endpoint: 'general-settings/get',
    });

    if (res) {
      await this.cacheService.set(cacheKey, res);
    }

    return res;
  }

  async update(data: any) {
    const res = await this.tcpConnectionService.account({
      endpoint: 'general-settings/update',
      payload: data,
    });

    if (res.userId) {
      const cacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.GENERAL(res.userId);
      const cached = await this.cacheService.get<
        Record<string, any> | undefined
      >(cacheKey);

      if (cached) {
        await this.cacheService.updatePreserveTtl(cacheKey, res);
      }
    }

    return res;
  }

  async reset() {
    const res = await this.tcpConnectionService.account({
      endpoint: 'general-settings/reset',
    });

    if (res.generalSettings) {
      const generalCacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.GENERAL(
        res.generalSettings.userId,
      );
      const privacyCacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.PRIVACY(
        res.generalSettings.userId,
      );
      const notificationCacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.NOTIFICATION(
        res.generalSettings.userId,
      );

      const cachedGeneral = await this.cacheService.get<
        Record<string, any> | undefined
      >(generalCacheKey);

      const cachedPrivacy = await this.cacheService.get<
        Record<string, any> | undefined
      >(privacyCacheKey);

      const cachedNotification = await this.cacheService.get<
        Record<string, any> | undefined
      >(notificationCacheKey);

      if (cachedGeneral) {
        await this.cacheService.updatePreserveTtl(
          generalCacheKey,
          res.generalSettings,
        );
      }

      if (cachedPrivacy) {
        await this.cacheService.updatePreserveTtl(
          privacyCacheKey,
          res.privacySettings,
        );
      }

      if (cachedNotification) {
        await this.cacheService.updatePreserveTtl(
          notificationCacheKey,
          res.notificationSettings,
        );
      }
    }

    return res;
  }
}
