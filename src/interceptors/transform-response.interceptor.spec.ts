import { describe, it, expect } from 'vitest';
import { of } from 'rxjs';
import { TransformResponseInterceptor } from './transform-response.interceptor.js';

describe('TransformResponseInterceptor', () => {
  it('debe transformar la respuesta exitosa envolviéndola con estructura estandarizada', async () => {
    const interceptor = new TransformResponseInterceptor();
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/api/v1/test' }),
      }),
    };
    const mockHandler: any = {
      handle: () => of({ test: 'ok' }),
    };

    const observable = interceptor.intercept(mockContext, mockHandler);
    observable.subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: 'ok' });
      expect(result.error).toBeNull();
      expect(result.meta.path).toBe('/api/v1/test');
      expect(result.meta.version).toBe('1.0.0');
    });
  });
});
