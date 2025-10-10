import { TenantEntity } from '../core/entities/TenantEntity';
import { ITenant } from '../core/interfaces/Tenant';

export default class TenantAdapter {
  static create(row: ITenant): TenantEntity {
    if (!row) throw new Error('Dados inválidos para criação de TenantEntity');

    return new TenantEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone,
      isActive: row.isActive ?? true,
      address: row.address ?? '',
      password: row.password,
    });
  }

  static toDb(entity: TenantEntity): Partial<ITenant> {
    return {
      id: entity.id ?? undefined,
      name: entity.name ?? undefined,
      slug: entity.slug ?? undefined,
      email: entity.email ?? undefined,
      phone: entity.phone ?? undefined,
      isActive: entity.isActive ?? undefined,
      address: entity.address ?? undefined,
      password: entity.password ?? undefined,
    };
  }
}
