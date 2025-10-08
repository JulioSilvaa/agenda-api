import { CustomerEntity } from '../core/entities/CustomerEntity';

// Representa o formato da linha retornada pelo sqlite para customers
export interface CustomerRow {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string;
  isActive: number | 0 | 1;
  totalBookings: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Campos extras ignorados serão tolerados pelo index signature opcional
  [key: string]: unknown;
}

/**
 * CustomerAdapter
 * Responsável por converter dados crus do banco (row) em CustomerEntity
 * e também preparar a entidade para persistência (toPersistence).
 * Segue o mesmo padrão de simples mapeamento usado no repositório de referência.
 */
export default class CustomerAdapter {
  static create(row: CustomerRow): CustomerEntity {
    if (!row) throw new Error('Row inválido para criação de CustomerEntity');
    return CustomerEntity.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      // Converte null explícito para undefined pois a entidade aceita undefined
      email: row.email === null ? undefined : row.email,
      phone: row.phone,
      isActive: row.isActive === undefined ? true : !!row.isActive,
      totalBookings: row.totalBookings ?? 0,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }

  static toPersistence(entity: CustomerEntity) {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      isActive: entity.isActive ? 1 : 0,
      totalBookings: entity.totalBookings,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
