import { count, desc, asc, eq } from 'drizzle-orm';
import type { PaginatedResponse } from '../dto/pagination.dto.js';

export interface BaseRepositoryOptions {
  idColumn?: any;
  orderByColumn?: any;
  orderDirection?: 'asc' | 'desc';
  entityName?: string;
}

export interface IBaseRepository<TEntity, TNewEntity = Partial<TEntity>, TId = number> {
  create(data: TNewEntity): Promise<TEntity>;
  findAll(page?: number, limit?: number): Promise<PaginatedResponse<TEntity>>;
  findById(id: TId): Promise<TEntity | null>;
  delete(id: TId): Promise<boolean>;
  update?(id: TId, data: Partial<TNewEntity>): Promise<TEntity | null>;
}

export abstract class BaseRepository<
  TEntity,
  TNewEntity = Partial<TEntity>,
  TDatabase = any,
  TTable = any,
> implements IBaseRepository<TEntity, TNewEntity, number | string> {
  constructor(
    protected readonly db: TDatabase,
    protected readonly table: TTable,
    protected readonly options?: BaseRepositoryOptions,
  ) {}

  protected getIdColumn(): any {
    return this.options?.idColumn ?? (this.table as any).id;
  }

  protected getOrderByColumn(): any {
    return (
      this.options?.orderByColumn ??
      (this.table as any).createdAt ??
      (this.table as any).id
    );
  }

  async create(data: TNewEntity): Promise<TEntity> {
    const [result] = await (this.db as any).insert(this.table).values(data);
    const insertId = Number(result?.insertId ?? (data as any)?.id);
    const created = insertId ? await this.findById(insertId) : null;

    if (!created) {
      const entityLabel = this.options?.entityName
        ? `${this.options.entityName} recién creada`
        : 'el registro recién creado';
      throw new Error(`Error al recuperar ${entityLabel}`);
    }

    return created;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResponse<TEntity>> {
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);
    const offset = (pageNumber - 1) * limitNumber;

    const [totalRecord] = await (this.db as any)
      .select({ total: count() })
      .from(this.table);

    const total = Number(totalRecord?.total ?? 0);

    let query = (this.db as any).select().from(this.table);

    const orderCol = this.getOrderByColumn();
    if (orderCol) {
      const direction = this.options?.orderDirection ?? 'desc';
      query = query.orderBy(direction === 'asc' ? asc(orderCol) : desc(orderCol));
    }

    const items = (await query.limit(limitNumber).offset(offset)) as TEntity[];

    return {
      items,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
    };
  }

  async findById(id: number | string): Promise<TEntity | null> {
    const idCol = this.getIdColumn();
    const results = await (this.db as any)
      .select()
      .from(this.table)
      .where(eq(idCol, id))
      .limit(1);

    return (results[0] as TEntity) ?? null;
  }

  async delete(id: number | string): Promise<boolean> {
    const idCol = this.getIdColumn();
    const [result] = await (this.db as any)
      .delete(this.table)
      .where(eq(idCol, id));

    return Boolean(result?.affectedRows && result.affectedRows > 0);
  }

  async update(id: number | string, data: Partial<TNewEntity>): Promise<TEntity | null> {
    const idCol = this.getIdColumn();
    await (this.db as any)
      .update(this.table)
      .set(data)
      .where(eq(idCol, id));

    return this.findById(id);
  }
}
