import { CacheService } from '@/src/app-settings/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { Injectable } from '@nestjs/common';
import { CACHE_KEYS, CLS_KEYS } from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ProfileService {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: CacheService,
    private readonly cls: ClsService,
  ) {}

  async getProfile() {
    const user = await this.cls.get(CLS_KEYS.USER);
    const cacheKey = CACHE_KEYS.ACCOUNT.PROFILE(user._id);
    const cached = await this.cacheService.get<Record<string, any> | undefined>(
      cacheKey,
    );

    if (cached) return cached;

    const res = await this.tcpConnectionService.account({
      endpoint: 'profile/findOne',
      payload: {
        query: {
          userId: user._id,
        },
      },
    });

    if (res) {
      await this.cacheService.set(cacheKey, res);
    }

    return res;
  }
}
