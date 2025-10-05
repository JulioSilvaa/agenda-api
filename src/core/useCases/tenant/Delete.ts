import { ITenantRepository } from "../../repositories/TenantRepository";

export class DeleteTenant {
  private readonly tenantRepository: ITenantRepository;
  constructor(tenantRepository: ITenantRepository) {
    this.tenantRepository = tenantRepository;
  }
  async execute(id: string): Promise<void> {
    const existingTenant = await this.tenantRepository.findById(id);
    if (!existingTenant) {
      throw new Error("Tenant não encontrado");
    }
    await this.tenantRepository.delete(id);
  }
}
