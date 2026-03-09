import { Injectable } from '@nestjs/common';
import {
  BaseException,
  CACHE_KEYS,
  CLS_KEYS,
  ExceptionMessages,
  HttpStatus,
} from 'connectfy-shared';
import { CacheService } from '@/src/app-settings/cache/cache.service';
import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuthService {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cacheService: CacheService,
    private readonly cls: ClsService,
  ) {}

  async signup(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/signup',
      payload: data,
    });
  }

  async verifySignup(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/verify-signup',
      payload: data,
    });
  }

  async resendSignupVerify(payload: any) {
    if (!payload) {
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE,
        HttpStatus.CONFLICT,
        { navigate: true },
      );
    }

    return this.tcpConnectionService.auth({
      endpoint: 'auth/verify-signup/resend',
      payload,
    });
  }

  async login(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/login',
      payload: data,
    });
  }

  async googleLogin(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/google/login',
      payload: data,
    });
  }

  async googleSignup(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/google/signup',
      payload: data,
    });
  }

  async forgotPassword(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/forgot-password',
      payload: data,
    });
  }

  async resetPassword(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/reset-password',
      payload: data,
    });
  }

  async refreshToken(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/refreshToken',
      payload: data,
    });
  }

  async logout(data: any, accessToken: string) {
    const user = this.cls.get(CLS_KEYS.USER);
    const userId = user?._id;

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/logout',
      payload: data,
    });

    if (res?.statusCode === 200 && userId) {
      const userCacheKey = CACHE_KEYS.AUTH.USER(userId);
      const profileCacheKey = CACHE_KEYS.ACCOUNT.PROFILE(userId);
      const accessCacheKey = CACHE_KEYS.AUTH.ACCESS_TOKEN(accessToken);
      const privacyCacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.PRIVACY(userId);
      const generalCacheKey = CACHE_KEYS.ACCOUNT.SETTINGS.GENERAL(userId);
      const notificationCacheKey =
        CACHE_KEYS.ACCOUNT.SETTINGS.NOTIFICATION(userId);
      await this.cacheService.removeMany([
        userCacheKey,
        profileCacheKey,
        accessCacheKey,
        privacyCacheKey,
        generalCacheKey,
        notificationCacheKey,
      ]);
    }

    return res;
  }

  async deleteAccount(data: any) {
    const user = this.cls.get(CLS_KEYS.USER);
    const userId = user?._id;

    const res = await this.tcpConnectionService.auth({
      endpoint: 'auth/delete-account',
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
      endpoint: 'auth/deactivate-account',
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

  async restoreAccount(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/restore-account',
      payload: data,
    });
  }

  async authenticateUser(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/authenticate-user',
      payload: data,
    });
  }

  async isValidToken(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/is-valid-token',
      payload: data,
    });
  }
}
