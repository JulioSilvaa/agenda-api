import { TenantEntity } from "../../entities/TenantEntity";
import { ITenant } from "../../interfaces/Tenant";
import { ITenantRepository } from "../../repositories/TenantRepository";

export class CreateTenant {
  private readonly tenantRepository: ITenantRepository;
  constructor(tenantRepository: ITenantRepository) {
    this.tenantRepository = tenantRepository;
  }

  async execute(data: ITenant): Promise<TenantEntity> {
    const existingTenant = await this.tenantRepository.findByEmail(data.email);
    if (existingTenant) {
      throw new Error("Já existe um tenant com este email");
    }

    const tenant = TenantEntity.create(data);
    console.log(data, "data no usecase");
    console.log(data.password, "data no usecase");
    return await this.tenantRepository.create(tenant);
  }
}
