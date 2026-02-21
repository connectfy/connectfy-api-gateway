import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ExceptionMessages, LANGUAGE } from 'connectfy-shared';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const language = request.body._lang ?? LANGUAGE.EN;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ExceptionMessages.INTERNAL_SERVER_ERROR_MESSAGE(language);
    let additional = null;

    // Log for debugging
    console.log('\n');
    if (exception.stack) this.logger.error('Exception stack', exception.stack);
    this.logger.error('Exception caught', JSON.stringify(exception, null, 2));

    // 1. If it's a proper NestJS HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'object' && responseBody !== null) {
        message = (responseBody as any).message || message;
        additional = (responseBody as any).additional || null;
      } else message = responseBody as string;
    }

    // 2. If it's an object from CRM service via RPC (Kafka/TCP)
    else if (typeof exception === 'object' && exception !== null) {
      status = exception?.statusCode || status;
      message = exception?.response?.message || exception?.message || message;
      additional = exception?.additional || null;
    }

    // 3. Fallback for non-object or unexpected errors
    else message = typeof exception === 'string' ? exception : message;

    const responsePayload = {
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    if (additional) responsePayload['additional'] = additional;

    response.status(status).json(responsePayload);
  }
}
