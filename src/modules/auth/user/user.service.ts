import { Injectable } from '@nestjs/common';
import { CACHE_KEYS, CLS_KEYS, PHONE_NUMBER_ACTION } from 'connectfy-shared';
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

    const { status, role, ...rest } = cached || {};

    return rest;
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
        };

        if (data.action === PHONE_NUMBER_ACTION.REMOVE) {
          updatedUser.phoneNumber = null;
        } else {
          updatedUser.phoneNumber = res.phoneNumber ?? cached.phoneNumber;
        }

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

  async deleteAccount(data: any) {
    const user = this.cls.get(CLS_KEYS.USER);
    const userId = user?._id;

    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/delete-account',
      payload: { ...data, userId },
    });

    if (res?.statusCode === 200 && userId) {
      const cacheKey = CACHE_KEYS.AUTH.USER(userId);
      await this.cacheService.remove(cacheKey);
    }

    return res;
  }

  async deactivateAccount(data: any) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/deactivate-account',
      payload: data,
    });

    if (res?.statusCode === 200) {
      const user = this.cls.get(CLS_KEYS.USER);
      const userId = user?._id;

      if (userId) {
        const cacheKey = CACHE_KEYS.AUTH.USER(userId);
        await this.cacheService.remove(cacheKey);
      }
    }

    return res;
  }
}
