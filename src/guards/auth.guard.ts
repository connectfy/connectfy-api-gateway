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
} from 'connectfy-shared';
import { AppCacheService } from '@modules/cache/cache.service';
import { ENVIRONMENT_VARIABLES } from '../common/constants/environment-variables';
import { TcpConnectionService } from '../app-settings/tcp-connections/tcp-connection.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly cacheService: AppCacheService,
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

    // 5. Token is valid. Check Cache.
    const cacheKey = CACHE_KEYS.USER(payload._id);
    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      const result = await this.tcpConnectionService.auth({
        endpoint: 'auth/refresh-token/verify-token',
        payload: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });

      if (!result || !result.user) {
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE,
          HttpStatus.UNAUTHORIZED,
          { navigate: true },
        );
      }
      user = result.user;
      await this.cacheService.set({ key: cacheKey, data: user });
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
