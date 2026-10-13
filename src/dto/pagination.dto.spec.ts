import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { PaginationDto } from './pagination.dto.js';

describe('PaginationDto', () => {
  it('debe tener valores por defecto asignados para page y limit', () => {
    const dto = new PaginationDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });
});
