import { TenantEntity } from '../core/entities/TenantEntity';

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  isActive: number | 0 | 1;
  address: string | null;
  password: string;
  [key: string]: unknown; // tolera colunas extras
}

// Responsável por mapear linhas do banco para TenantEntity e vice-versa
export default class TenantAdapter {
  static fromRow(row: TenantRow): TenantEntity {
    if (!row) throw new Error('Row inválido para Tenant');
    return TenantEntity.create({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone,
      isActive: !!row.isActive,
      address: row.address,
      password: row.password,
    });
  }

  static toPersistence(entity: TenantEntity) {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      email: entity.email,
      phone: entity.phone,
      isActive: entity.isActive ? 1 : 0,
      address: entity.address,
      password: entity.password,
    };
  }
}
