import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    
    const now = Date.now();
    const startTime = new Date();
    
    // Məlumatları toplayırıq
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const method = request.method;
    const url = request.url;
    const clientIP = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent') || 'N/A';
    
    // Request ID (mövcuddursa istifadə et)
    const requestId = request.headers['x-request-id'] || 'N/A';
    
    // Rəng kodları
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      bgGray: '\x1b[100m',
    };
    
    // Konsol log formatı
    console.log('\n' + colors.bgGray + '══════════════════════════════════════════════════════════' + colors.reset);
    
    // Başlıq
    console.log(colors.bright + colors.cyan + '🌐 HTTP REQUEST LOG' + colors.reset);
    console.log(colors.dim + '╔════════════════════════════════════════════════════════╗' + colors.reset);
    
    // Əsas məlumatlar
    this.printLogEntry('Start Time', startTime.toISOString(), colors.cyan);
    this.printLogEntry('Controller', controllerName, colors.green);
    this.printLogEntry('Handler', handlerName, colors.green)
    this.printLogEntry('Method', method, this.getMethodColor(method));
    this.printLogEntry('URL', url, colors.dim + colors.white);
    
    // Əlavə məlumatlar
    this.printLogEntry('Request ID', requestId.toString(), colors.magenta);
    this.printLogEntry('Client IP', clientIP ?? "UNKONWN IP", colors.blue);
    this.printLogEntry('User Agent', userAgent.substring(0, 60) + (userAgent.length > 60 ? '...' : ''), colors.dim + colors.white);
    
    console.log(colors.dim + '╚════════════════════════════════════════════════════════╝' + colors.reset);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode;
          
          console.log(colors.dim + '╔════════════════════════════════════════════════════════╗' + colors.reset);
          
          this.printLogEntry('Status Code', statusCode.toString(), this.getStatusCodeColor(statusCode));
          this.printLogEntry('Duration', `${duration}ms`, this.getDurationColor(duration));
          this.printLogEntry('End Time', new Date().toISOString(), colors.cyan);
          
          console.log(colors.dim + '╚════════════════════════════════════════════════════════╝' + colors.reset);
          console.log(colors.bgGray + '══════════════════════════════════════════════════════════' + colors.reset + '\n');
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error.status || 500;
          
          console.log(colors.dim + '╔════════════════════════════════════════════════════════╗' + colors.reset);
          
          this.printLogEntry('Status Code', statusCode.toString(), colors.red);
          this.printLogEntry('Error', error.message || 'Unknown error', colors.red);
          this.printLogEntry('Duration', `${duration}ms`, colors.red);
          this.printLogEntry('End Time', new Date().toISOString(), colors.cyan);
          
          console.log(colors.dim + '╚════════════════════════════════════════════════════════╗' + colors.reset);
          console.log(colors.bgGray + '══════════════════════════════════════════════════════════' + colors.reset + '\n');
        }
      })
    );
  }

  private printLogEntry(label: string, value: string, color: string = '\x1b[0m'): void {
    const colors = {
      reset: '\x1b[0m',
      dim: '\x1b[2m',
    };
    
    console.log(
      colors.dim + '║ ' + colors.reset + 
      colors.dim + label.padEnd(15, ' ') + colors.reset + ' ' +
      colors.dim + ':' + colors.reset + ' ' +
      color + value + colors.reset
    );
  }

  private getMethodColor(method: string): string {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      blue: '\x1b[34m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      magenta: '\x1b[35m',
    };
    
    switch (method.toUpperCase()) {
      case 'GET': return colors.green;
      case 'POST': return colors.yellow;
      case 'PUT': return colors.blue;
      case 'DELETE': return colors.red;
      case 'PATCH': return colors.magenta;
      default: return colors.reset;
    }
  }

  private getStatusCodeColor(statusCode: number): string {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
    };
    
    if (statusCode >= 200 && statusCode < 300) return colors.green;
    if (statusCode >= 300 && statusCode < 400) return colors.yellow;
    if (statusCode >= 400) return colors.red;
    return colors.reset;
  }

  private getDurationColor(duration: number): string {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
    };
    
    if (duration < 200) return colors.green;
    if (duration < 500) return colors.yellow;
    return colors.red;
  }
}