import { TenantEntity } from '../entities/TenantEntity';

export interface ITenantRepository {
  create(tenant: TenantEntity): Promise<TenantEntity>;
  findByEmail(email: string): Promise<TenantEntity | null>;
  delete(id: string): Promise<void>;
  update(tenant: TenantEntity): Promise<TenantEntity>;
  findById(id: string): Promise<TenantEntity | null>;
}
