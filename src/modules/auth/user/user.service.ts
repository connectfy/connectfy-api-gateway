import { Injectable } from '@nestjs/common';
import { CACHE_KEYS, CLS_KEYS } from 'connectfy-shared';
import { CacheService } from '@/src/app-settings/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class UserService {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: CacheService,
    private readonly cls: ClsService,
  ) {}

  async getMe() {
    const reqUser = await this.cls.get(CLS_KEYS.USER);
    if (!reqUser || !reqUser._id) return undefined;

    const cacheKey = CACHE_KEYS.AUTH.USER(reqUser._id);
    const cached = await this.cacheService.get<Record<string, any>>(cacheKey);

    return cached;
  }

  async changeUsername(data: any) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-username',
      payload: data,
    });

    if (res && res._id) {
      const cacheKey = CACHE_KEYS.AUTH.USER(res._id);
      const cached = await this.cacheService.get<
        Record<string, any> | undefined
      >(cacheKey);

      if (cached) {
        const updatedUser = {
          ...cached,
          username: res.username ?? cached.username,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }

  async changeEmail(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'user/change-email',
      payload: data,
    });
  }

  async verifyEmailChange(data: any) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-email/verify',
      payload: data,
    });

    if (res && res._id) {
      const cacheKey = CACHE_KEYS.AUTH.USER(res._id);
      const cached = await this.cacheService.get<
        Record<string, any> | undefined
      >(cacheKey);

      if (cached) {
        const updatedUser = {
          ...cached,
          email: res.email ?? cached.email,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }

  async changePassword(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'user/change-password',
      payload: data,
    });
  }

  async changePhoneNumber(data: any) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-phone-number',
      payload: data,
    });

    if (res && res._id) {
      const cacheKey = CACHE_KEYS.AUTH.USER(res._id);
      const cached = await this.cacheService.get<
        Record<string, any> | undefined
      >(cacheKey);

      if (cached) {
        const updatedUser = {
          ...cached,
          phoneNumber: res.phoneNumber ?? cached.phoneNumber,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }

  async checkUnique(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'user/check-unique',
      payload: data,
    });
  }

  async updateTwoFactorAuth(data: any) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/two-factor',
      payload: data,
    });

    if (res && res._id) {
      const cacheKey = CACHE_KEYS.AUTH.USER(res._id);
      const cached = await this.cacheService.get<
        Record<string, any> | undefined
      >(cacheKey);

      if (cached) {
        const updatedUser = {
          ...cached,
          isTwoFactorEnabled:
            res.isTwoFactorEnabled ?? cached.isTwoFactorEnabled,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }
}
