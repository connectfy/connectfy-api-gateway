import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import {
  BaseException,
  CLS_KEYS,
  ExceptionMessages,
  HttpStatus,
} from 'connectfy-shared';
import { validate } from 'uuid';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class DeviceIdInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();

    const deviceId = request.headers['x-device-id'];

    if (!deviceId || Array.isArray(deviceId)) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    if (!validate(deviceId)) {
      throw new BaseException(
        'Invalid Device ID format',
        HttpStatus.BAD_REQUEST,
        { navigate: true },
      );
    }

    this.cls.set(CLS_KEYS.DEVICE_ID, deviceId);

    return next.handle();
  }
}
