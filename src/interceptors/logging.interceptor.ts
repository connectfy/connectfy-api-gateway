import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // HTTP Request details
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    const method = request.method;
    const headers = request.headers;
    const queryParams = request.query;
    const params = request.params;
    const body = request.body;

    // User detail (If using authentication)
    const user = request.user;

    // Controller and Handler details
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    // Log all extracted information
    console.log(`Date: ${new Date()}`);
    console.log(`[${method}] ${url}`);
    console.log(`Controller: ${controllerName}, Handler: ${handlerName}`);
    // console.log('Headers:', headers);
    // console.log('Query Params:', queryParams);
    // console.log('Path Params:', params);
    // console.log('Request Body:', body);
    // console.log('User Info:', user);

    return next
      .handle()
      .pipe(
        tap(() => console.log(`Request duration ... ${Date.now() - now}ms\n`)),
      );
  }
}
