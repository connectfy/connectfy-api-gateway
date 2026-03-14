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

  async verifyLogin(data: any) {
    return this.tcpConnectionService.auth({
      endpoint: 'auth/verify-login',
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
      const accessCacheKey = CACHE_KEYS.AUTH.ACCESS_TOKEN(accessToken);
      await this.cacheService.remove(accessCacheKey);
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
