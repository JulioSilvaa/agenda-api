import { TenantEntity } from '../../entities/TenantEntity';
import { ITenantRepository } from '../../repositories/TenantRepository';

// Define um DTO para atualização com campos opcionais
type UpdateTenantDTO = Partial<Pick<TenantEntity, 'name' | 'email' | 'password'>>;

export default class UpdateTenant {
  private readonly tenantRepository: ITenantRepository;

  constructor(tenantRepository: ITenantRepository) {
    this.tenantRepository = tenantRepository;
  }

  async execute(id: string, data: UpdateTenantDTO): Promise<TenantEntity> {
    const existingTenant = await this.tenantRepository.findById(id);
    if (!existingTenant) {
      throw new Error('Tenant não encontrado');
    }

    if (data.email && data.email !== existingTenant.email) {
      const emailTaken = await this.tenantRepository.findByEmail(data.email);
      if (emailTaken) {
        throw new Error('Email já está em uso');
      }
    }

    const updatedTenant = TenantEntity.create({
      slug: '',
      isActive: existingTenant.isActive,
      name: data.name !== undefined && data.name !== null ? data.name : existingTenant.name!,
      email: data.email !== undefined && data.email !== null ? data.email : existingTenant.email!,
      password:
        data.password !== undefined && data.password !== null
          ? data.password
          : existingTenant.password!,
    });

    return await this.tenantRepository.update(updatedTenant);
  }
}
