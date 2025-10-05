import crypto from 'crypto';

import { ServiceEntity } from '../../entities/ServiceEntity';
import { IService } from '../../interfaces/Service';
import { IServiceRepository } from '../../repositories/ServiceRepository';
import { ITenantRepository } from '../../repositories/TenantRepository';

export class CreateService {
  private readonly serviceRepository: IServiceRepository;
  private readonly tenantRepository: ITenantRepository;

  constructor(serviceRepository: IServiceRepository, tenantRepository: ITenantRepository) {
    this.serviceRepository = serviceRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(data: Omit<IService, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceEntity> {
    // Validar se o tenant existe
    const tenantExists = await this.tenantRepository.findById(data.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant não encontrado');
    }

    // Validar se já existe um serviço com o mesmo nome no tenant
    const existingService = await this.serviceRepository.findByName(data.name, data.tenantId);
    if (existingService) {
      throw new Error('Já existe um serviço com este nome neste tenant');
    }

    // Criar serviço
    const serviceData: IService = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const service = ServiceEntity.create(serviceData);
    return await this.serviceRepository.create(service);
  }
}
