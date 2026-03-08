import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import {
  CLS_KEYS,
  CACHE_KEYS,
  ExceptionMessages,
  BaseException,
  EXPIRE_DATES,
} from 'connectfy-shared';
import { CacheService } from '@/src/app-settings/cache/cache.service';
import { ENVIRONMENT_VARIABLES } from '../common/constants/environment-variables';
import { TcpConnectionService } from '../app-settings/tcp-connections/tcp-connection.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly defaultUserTtl = EXPIRE_DATES.TOKEN.ONE_MINUTE * 15;
  private readonly defaultTokenTtl = EXPIRE_DATES.TOKEN.ONE_MINUTE * 15;

  constructor(
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
    private readonly cls: ClsService,
    private readonly tcpConnectionService: TcpConnectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);
    const refreshToken = request.cookies?.refresh_token;

    // 1. No token provided -> Force Login
    if (!accessToken || !refreshToken) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const accessSecret = ENVIRONMENT_VARIABLES.JWT_ACCESS_SECRET;
    let payload: any;

    const accessCacheKey = CACHE_KEYS.AUTH.ACCESS_TOKEN(accessToken);
    const payloadInCache =
      await this.cacheService.get<Record<string, any>>(accessCacheKey);

    if (payloadInCache) {
      payload = payloadInCache;
    } else {
      try {
        // 2. Verify token (Do NOT ignore expiration)
        payload = this.jwtService.verify(accessToken, { secret: accessSecret });
      } catch (error) {
        // 3. If strictly EXPIRED -> Standard 401 (Client will attempt refresh)
        if (error.name === 'TokenExpiredError') {
          throw new BaseException(
            ExceptionMessages.TOKEN_EXPIRED,
            HttpStatus.UNAUTHORIZED,
          );
        }
        // 4. If Invalid/Malformed -> Force Login
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE,
          HttpStatus.UNAUTHORIZED,
          { navigate: true },
        );
      }
    }

    if (!payload || !payload._id) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    await this.cacheService.set(accessCacheKey, payload, this.defaultTokenTtl);

    // 5. Token is valid. Check Cache.
    const cacheKey = CACHE_KEYS.AUTH.USER(payload._id);

    const loader = async () => {
      const result = await this.tcpConnectionService.auth({
        endpoint: 'auth/refresh-token/verify-token',
        payload: { access_token: accessToken, refresh_token: refreshToken },
      });

      if (!result || !result.user) {
        return undefined;
      }

      return result.user;
    };

    let user;

    try {
      user = await this.cacheService.getOrSet<Record<string, any> | undefined>(
        cacheKey,
        loader,
        this.defaultUserTtl,
      );
    } catch (err) {
      // as fallback, attempt to fetch directly (best-effort)
      try {
        const direct = await loader();
        user = direct;
      } catch (err2) {
        // if direct fetch fails -> unauthorized (can't verify user)
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE,
          HttpStatus.UNAUTHORIZED,
          { navigate: true },
        );
      }
    }

    if (!user) {
      // loader didn't return user -> unauthorized
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    this.attachUser(request, user);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private attachUser(request: any, user: any) {
    request.user = user;
    this.cls.set(CLS_KEYS.USER, user);
    this.cls.set(CLS_KEYS.LANG, user.language);

    request.body = { ...request.body, _loggedUser: user };
  }
}
