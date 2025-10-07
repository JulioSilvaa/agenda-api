import { ServiceEntity } from "../../entities/ServiceEntity";
import { IServiceRepository } from "../../repositories/ServiceRepository";

export default class FindServices {
  private readonly serviceRepository: IServiceRepository;
  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(tenantId: string): Promise<ServiceEntity[]> {
    const allServices = await this.serviceRepository.findAll();
    return allServices.filter((service) => service.tenantId === tenantId);
  }
}
