import { ServiceEntity } from "../../entities/ServiceEntity";
import { IService } from "../../interfaces/Service";
import { IServiceRepository } from "../../repositories/ServiceRepository";
import { ITenantRepository } from "../../repositories/TenantRepository";

export default class UpdateService {
  private readonly serviceRepository: IServiceRepository;
  private readonly tenantRepository: ITenantRepository;

  constructor(
    serviceRepository: IServiceRepository,
    tenantRepository: ITenantRepository
  ) {
    this.serviceRepository = serviceRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(service: ServiceEntity): Promise<IService> {
    const existingService = await this.serviceRepository.findById(service.id!);
    if (!existingService) {
      throw new Error("Service not found");
    }
    const tenant = await this.tenantRepository.findById(service.tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    const updatedService = await this.serviceRepository.create(service);
    const serviceUpdated = await this.serviceRepository.update(updatedService);

    return serviceUpdated;
  }
}
