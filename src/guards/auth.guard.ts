import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

import {
  ExceptionMessages,
  ExceptionTypes,
} from '../common/constants/exception.constants';
import { BaseException } from '../common/constants/custom.exception';
import { sendWithContext } from '../common/helpers/microservice-request.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE_TCP')
    private readonly authService: ClientProxy,

    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = this.extractTokenFromHeader(request);
    const refreshToken = request.cookies?.refresh_token;

    if (!accessToken || !refreshToken) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');

    let payload: any = null;

    // VERIFY ACCESS TOKEN
    payload = this.jwtService.verify(accessToken, {
      secret: accessSecret,
      ignoreExpiration: true,
    });

    const isExpired = Date.now() >= payload.exp * 1000;

    await this.cacheService.clear();

    // TRY CACHE (ONLY IF TOKEN WAS VALID)
    if (!isExpired && payload && payload._id) {
      const userId = payload._id;
      const cacheKey = `user:${userId}`;
      const cachedUser = await this.cacheService.get(cacheKey);

      if (cachedUser) {
        this.attachUser(request, cachedUser);
        return true;
      }
    }

    // REFRESH FLOW (TOKEN EXPIRED OR CACHE MISS)
    const result = await sendWithContext({
      client: this.authService,
      endpoint: 'auth/refresh-token/verify-token',
      payload: {
        access_token: accessToken,
        refresh_token: refreshToken
      },
      cls: this.cls,
    });

    if (!result || !result.user) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );
    }

    // 4️⃣ SAVE TO CACHE
    const cacheKey = `user:${result.user.user._id}`;
    await this.cacheService.set(
      cacheKey,
      result.user,
      60 * 60 * 1000, // 60 minutes
    );
    this.attachUser(request, result.user);
    return true;
  }

  // ==========================
  // HELPERS
  // ==========================

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private attachUser(request: any, user: any) {
    request.user = user;
    this.cls.set('user', user);
    request.body = {
      ...request.body,
      _loggedUser: user,
    };
  }
}
