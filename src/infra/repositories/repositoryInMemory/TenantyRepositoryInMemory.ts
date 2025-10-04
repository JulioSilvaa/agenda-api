import { TenantEntity } from '../../../core/entities/TenantEntity';
import { ITenantRepository } from '../../../core/repositories/TenantRepository';

export class TenantRepositoryInMemory implements ITenantRepository {
  private tenants: TenantEntity[] = [];

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    this.tenants.push(tenant);
    return tenant;
  }
  async findByEmail(email: string): Promise<TenantEntity | null> {
    const tenant = this.tenants.find(t => t.email === email);
    return tenant ? tenant : null;
  }
}
