import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage: string | object = 'Internal server error';
    let errorType = 'InternalServerError';

    if (isHttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        errorMessage = (resObj.message as string | object) || exception.message;
        errorType = (resObj.error as string) || exception.name;
      } else {
        errorMessage = res;
        errorType = exception.name;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorType = exception.name;
    }

    response.status(status).json({
      success: false,
      data: null,
      error: {
        statusCode: status,
        message: errorMessage,
        error: errorType,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request?.url || '',
        version: '1.0.0',
      },
    });
  }
}
