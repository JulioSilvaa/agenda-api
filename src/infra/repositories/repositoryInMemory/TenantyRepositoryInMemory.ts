import { TenantEntity } from '../../../core/entities/TenantEntity';
import { ITenantRepository } from '../../../core/repositories/TenantRepository';

export class TenantRepositoryInMemory implements ITenantRepository {
  private tenants: TenantEntity[] = [];

  delete(id: string): Promise<void> {
    const index = this.tenants.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Tenant não encontrado');
    }
    this.tenants.splice(index, 1);
    return Promise.resolve();
  }
  update(tenant: TenantEntity): Promise<TenantEntity> {
    const index = this.tenants.findIndex(t => t.id === tenant.id);
    if (index === -1) {
      throw new Error('Tenant não encontrado');
    }
    this.tenants[index] = tenant;
    return Promise.resolve(tenant);
  }

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    this.tenants.push(tenant);
    return tenant;
  }
  async findByEmail(email: string): Promise<TenantEntity | null> {
    const tenant = this.tenants.find(t => t.email === email);
    return tenant ? tenant : null;
  }
  async findById(id: string): Promise<TenantEntity | null> {
    const tenant = this.tenants.find(t => t.id === id);
    return tenant ? tenant : null;
  }
}
