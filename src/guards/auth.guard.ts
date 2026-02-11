import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { BaseException } from '@common/constants/custom.exception';
import { sendWithContext } from '@common/helpers/microservice-request.helper';
import {
  ENV,
  CACHE_KEYS,
  MICROSERVICE_NAMES,
} from '@common/constants/constants';
import { CLS_KEYS } from '@common/enums/enums';
import { AppCacheService } from '@modules/cache/cache.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(MICROSERVICE_NAMES.AUTH.TCP)
    private readonly authService: ClientProxy,

    private readonly cacheService: AppCacheService,

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

    const accessSecret = this.configService.get<string>(
      ENV.AUTH.JWT.ACCESS.SECRET,
    );

    let payload: any = null;

    try {
      payload = this.jwtService.verify(accessToken, {
        secret: accessSecret,
        ignoreExpiration: true,
      });
    } catch (error) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const isExpired = Date.now() >= payload.exp * 1000;

    // TRY CACHE (ONLY IF TOKEN WAS VALID)
    if (!isExpired && payload && payload._id) {
      const userId = payload._id;
      const cacheKey = CACHE_KEYS.USER(userId);
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
        refresh_token: refreshToken,
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

    // SAVE TO CACHE
    const cacheKey = CACHE_KEYS.USER(result.user.user._id);
    await this.cacheService.set({
      key: cacheKey,
      data: result.user,
    });
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
    this.cls.set(CLS_KEYS.USER, user);
    request.body = {
      ...request.body,
      _loggedUser: user,
    };
  }
}
