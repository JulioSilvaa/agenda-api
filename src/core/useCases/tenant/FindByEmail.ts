import { ITenantRepository } from '../../repositories/TenantRepository';

export class FindTenantByEmail {
  private readonly tenantRepository: ITenantRepository;
  constructor(tenantRepository: ITenantRepository) {
    this.tenantRepository = tenantRepository;
  }
  async execute(email: string) {
    const tenant = await this.tenantRepository.findByEmail(email);
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }
    return tenant;
  }
}
