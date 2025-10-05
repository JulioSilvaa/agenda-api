import { ServiceEntity } from '../entities/ServiceEntity';

export interface IServiceRepository {
  create(service: ServiceEntity): Promise<ServiceEntity>;
  update(service: ServiceEntity): Promise<ServiceEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ServiceEntity | null>;
  findByTenantId(tenantId: string): Promise<ServiceEntity[]>;
  findByName(name: string, tenantId: string): Promise<ServiceEntity | null>;
}
