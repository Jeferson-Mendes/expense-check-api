import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface CustomErrorResponse {
  error_code: string;
  error_description: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();

    let errorCode = 'UNKNOWN_ERROR';
    let errorDescription = 'An unknown error occurred';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const errorResponse = exceptionResponse as Record<string, any>;
      errorCode = errorResponse.error || 'UNKNOWN_ERROR';
      errorDescription = errorResponse.message || 'An unknown error occurred';
    } else if (typeof exceptionResponse === 'string') {
      errorDescription = exceptionResponse;
    }

    const customResponse: CustomErrorResponse = {
      error_code: errorCode,
      error_description: errorDescription,
    };

    response.status(status).json(customResponse);
  }
}
