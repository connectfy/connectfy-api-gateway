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

    if (cached) return cached;

    return undefined;
  }

  async changeUsername(data: any) {
    const res = await this.tcpConnectionService.auth({
      endpoint: 'user/change-username',
      payload: data,
    });

    if (res && res._id) {
      const cacheKey = CACHE_KEYS.AUTH.USER(res._id);
      const cachedUser =
        await this.cacheService.get<Record<string, any>>(cacheKey);

      if (cachedUser) {
        const updatedUser = {
          ...cachedUser,
          username: res.username ?? cachedUser.username,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }

  async changeEmail(data: any) {
    return await this.tcpConnectionService.auth({
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
      const cachedUser =
        await this.cacheService.get<Record<string, any>>(cacheKey);

      if (cachedUser) {
        const updatedUser = {
          ...cachedUser,
          email: res.email ?? cachedUser.email,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }

  async changePassword(data: any) {
    return await this.tcpConnectionService.auth({
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
      const cachedUser =
        await this.cacheService.get<Record<string, any>>(cacheKey);

      if (cachedUser) {
        const updatedUser = {
          ...cachedUser,
          phoneNumber: res.phoneNumber ?? cachedUser.phoneNumber,
        };

        await this.cacheService.updatePreserveTtl(cacheKey, updatedUser);
      }
    }

    return res;
  }

  async checkUnique(data: any) {
    return await this.tcpConnectionService.auth({
      endpoint: 'user/check-unique',
      payload: data,
    });
  }
}
