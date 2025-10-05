import { TenantEntity } from '../entities/TenantEntity';

export interface ITenantRepository {
  create(tenant: TenantEntity): Promise<TenantEntity>;
  findByEmail(email: string): Promise<TenantEntity | null>;
  findById(id: string): Promise<TenantEntity | null>;
}
