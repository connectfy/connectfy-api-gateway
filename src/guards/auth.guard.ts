import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '../common/constants/exception.constants';
import { Request } from 'express';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BaseException } from '../common/constants/custom.exception';
import { ClsService } from 'nestjs-cls';
import { sendWithContext } from '../common/helpers/microservice-request.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly authService: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly cls: ClsService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refresh_token = request.cookies.refresh_token;
    const access_token = this.extractTokenFromHeader(request);

    if (!access_token || !refresh_token)
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );

    const cachedUser = await this.cacheService.get(access_token);
    if (cachedUser) {
      request.user = cachedUser;
      request.body = { ...request.body, _loggedUser: cachedUser };
      return true;
    }

    const result = await sendWithContext({
      client: this.authService,
      endpoint: '/auth/refresh-token/verify-token',
      payload: { access_token },
    });

    if (
      !result ||
      result.stauts === HttpStatus.UNAUTHORIZED ||
      result.stauts === HttpStatus.NOT_FOUND ||
      !result.user
    )
      throw new BaseException(
        result?.message || 'Token not found',
        result.status,
        result.error,
      );

    await this.cacheService.set(access_token, result.user, 850);
    request.user = result.user;
    this.cls.set('user', result.user);
    request.body = { ...request.body, _loggedUser: result.user };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
