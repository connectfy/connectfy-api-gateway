import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { ExceptionMessages, ExceptionTypes } from './exception.constants';

export class BaseException extends RpcException {
  constructor(
    message = ExceptionMessages.INTERNAL_SERVER_ERROR_MESSAGE,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    error = ExceptionTypes.INTERNAL_SERVER_ERROR,
    additional?: Record<string, any>,
  ) {
    super({ message, statusCode, error, additional });
  }
}
