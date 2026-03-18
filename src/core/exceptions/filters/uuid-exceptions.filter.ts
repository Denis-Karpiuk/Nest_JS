import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';

const UUID_VALIDATION_MESSAGE = 'uuid is expected';

@Catch(BadRequestException)
export class UUIDExceptionsFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const responseObj = exception.getResponse() as { message?: string };
    const message =
      typeof exception.message === 'string'
        ? exception.message
        : (responseObj?.message ?? '');

    const isUuidError = message.toLowerCase().includes(UUID_VALIDATION_MESSAGE);
    if (!isUuidError) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseBody = {
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Validation failed (uuid is expected)',
      extensions: [],
      code: DomainExceptionCode.BadRequest,
    };

    response.status(HttpStatus.BAD_REQUEST).json(responseBody);
  }
}
