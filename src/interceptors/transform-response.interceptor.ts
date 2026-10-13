import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  meta: {
    timestamp: string;
    path: string;
    version: string;
  };
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request?.url || '';

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          path,
          version: '1.0.0',
        },
      })),
    );
  }
}
