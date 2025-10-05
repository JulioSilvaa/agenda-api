import { TenantEntity } from "../../entities/TenantEntity";
import { ITenantRepository } from "../../repositories/TenantRepository";

export class FindTenantById {
  private readonly tenantRepository: ITenantRepository;

  constructor(tenantRepository: ITenantRepository) {
    this.tenantRepository = tenantRepository;
  }
  async execute(id: string): Promise<TenantEntity | null> {
    if (!id) {
      throw new Error("ID do tenant é obrigatório");
    }

    const tenant = await this.tenantRepository.findById(id);

    if (!tenant) {
      throw new Error("Tenant não encontrado");
    }
    return tenant;
  }
}
