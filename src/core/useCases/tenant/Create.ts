import crypto from 'crypto';

import { TenantEntity } from '../../entities/TenantEntity';
import { ITenant } from '../../interfaces/Tenant';
import { ITenantRepository } from '../../repositories/TenantRepository';

export class CreateTenant {
  private readonly tenantRepository: ITenantRepository;
  constructor(tenantRepository: ITenantRepository) {
    this.tenantRepository = tenantRepository;
  }

  async execute(data: ITenant): Promise<TenantEntity> {
    const existingTenant = await this.tenantRepository.findByEmail(data.email);
    if (existingTenant) {
      throw new Error('Já existe um tenant com este email');
    }

    const tenantData: ITenant = {
      ...data,
      id: crypto.randomUUID(),
    };

    const tenant = TenantEntity.create(tenantData);
    return await this.tenantRepository.create(tenant);
  }
}
