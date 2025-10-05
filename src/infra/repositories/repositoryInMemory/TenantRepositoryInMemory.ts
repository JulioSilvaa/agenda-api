import { TenantEntity } from "../../../core/entities/TenantEntity";
import { ITenantRepository } from "../../../core/repositories/TenantRepository";

export class TenantRepositoryInMemory implements ITenantRepository {
  private tenants: TenantEntity[] = [];

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    this.tenants.push(tenant);
    return tenant;
  }
  async findByEmail(email: string): Promise<TenantEntity | null> {
    const tenant = this.tenants.find((t) => t.email === email);
    return tenant ? tenant : null;
  }

  async delete(id: string): Promise<void> {
    this.tenants = this.tenants.filter((t) => t.id !== id);
  }

  async update(tenant: TenantEntity): Promise<TenantEntity> {
    const index = this.tenants.findIndex((t) => t.id === tenant.id);
    if (index === -1) {
      throw new Error("Tenant não encontrado");
    }
    this.tenants[index] = tenant;
    return tenant;
  }

  async findById(id: string): Promise<TenantEntity | null> {
    const tenant = this.tenants.find((t) => t.id === id);
    return tenant ? tenant : null;
  }
}
