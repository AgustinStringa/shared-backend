import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseRepository } from './base.repository.js';

interface TestEntity {
  id: number;
  nombre: string;
  createdAt?: Date;
}

interface NewTestEntity {
  nombre: string;
}

class TestRepository extends BaseRepository<TestEntity, NewTestEntity> {
  constructor(db: any, table: any, options?: any) {
    super(db, table, options);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockDb: any;
  const mockTable = {
    id: { name: 'id' },
    createdAt: { name: 'created_at' },
  };

  beforeEach(() => {
    mockDb = {
      insert: vi.fn(),
      select: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };
    repository = new TestRepository(mockDb, mockTable, {
      entityName: 'el registro de prueba',
    });
  });

  describe('create', () => {
    it('debe insertar y retornar la entidad creada', async () => {
      const createdEntity: TestEntity = { id: 1, nombre: 'Test' };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      });

      // findById se llama internamente
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([createdEntity]),
          }),
        }),
      });

      const result = await repository.create({ nombre: 'Test' });

      expect(result).toEqual(createdEntity);
      expect(mockDb.insert).toHaveBeenCalledWith(mockTable);
    });

    it('debe lanzar error si no se encuentra la entidad recién creada', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 99 }]),
      });

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(repository.create({ nombre: 'Test' })).rejects.toThrow(
        /Error al recuperar el registro de prueba recién creada/i,
      );
    });
  });

  describe('findAll', () => {
    it('debe paginar los registros correctamente', async () => {
      const mockItems: TestEntity[] = [
        { id: 1, nombre: 'A' },
        { id: 2, nombre: 'B' },
      ];

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ total: 15 }]),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockItems),
              }),
            }),
          }),
        });

      const result = await repository.findAll(2, 5);

      expect(result).toEqual({
        items: mockItems,
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });
  });

  describe('findById', () => {
    it('debe devolver la entidad si existe', async () => {
      const mockEntity: TestEntity = { id: 1, nombre: 'Encontrado' };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockEntity]),
          }),
        }),
      });

      const result = await repository.findById(1);
      expect(result).toEqual(mockEntity);
    });

    it('debe devolver null si no existe', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('debe retornar true si eliminó filas', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
      });

      const result = await repository.delete(1);
      expect(result).toBe(true);
    });

    it('debe retornar false si no afectó filas', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockResolvedValue([{ affectedRows: 0 }]),
      });

      const result = await repository.delete(999);
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('debe actualizar y retornar el registro actualizado', async () => {
      const updatedEntity: TestEntity = { id: 1, nombre: 'Actualizado' };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
        }),
      });

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([updatedEntity]),
          }),
        }),
      });

      const result = await repository.update(1, { nombre: 'Actualizado' });
      expect(result).toEqual(updatedEntity);
    });
  });
});
