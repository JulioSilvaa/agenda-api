import { ServiceEntity } from '../../../core/entities/ServiceEntity';
import { IServiceRepository } from '../../../core/repositories/ServiceRepository';

export class ServiceRepositoryInMemory implements IServiceRepository {
  private services: ServiceEntity[] = [];

  async create(service: ServiceEntity): Promise<ServiceEntity> {
    this.services.push(service);
    return service;
  }

  async findAll(): Promise<ServiceEntity[]> {
    return this.services;
  }

  async update(service: ServiceEntity): Promise<ServiceEntity> {
    const index = this.services.findIndex(s => s.id === service.id);
    if (index === -1) {
      throw new Error('Serviço não encontrado');
    }
    this.services[index] = service;
    return service;
  }

  async delete(id: string): Promise<void> {
    this.services = this.services.filter(s => s.id !== id);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const service = this.services.find(s => s.id === id);
    return service ? service : null;
  }

  async findByTenantId(tenantId: string): Promise<ServiceEntity[]> {
    return this.services.filter(s => s.tenantId === tenantId);
  }

  async findByName(name: string, tenantId: string): Promise<ServiceEntity | null> {
    const service = this.services.find(s => s.name === name && s.tenantId === tenantId);
    return service ? service : null;
  }
}
