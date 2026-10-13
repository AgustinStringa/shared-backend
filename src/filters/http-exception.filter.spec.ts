import { describe, it, expect, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter.js';

describe('AllExceptionsFilter', () => {
  it('debe capturar HttpException y responder con estructura estandarizada de error', () => {
    const filter = new AllExceptionsFilter();
    const statusMock = vi.fn().mockReturnThis();
    const jsonMock = vi.fn();

    const mockHost: any = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusMock,
          json: jsonMock,
        }),
        getRequest: () => ({
          url: '/api/v1/planes',
        }),
      }),
    };

    const exception = new HttpException('Plan no encontrado', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: null,
        error: expect.objectContaining({
          statusCode: 404,
          message: 'Plan no encontrado',
        }),
      }),
    );
  });
});
