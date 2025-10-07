import { IServiceRepository } from "../../repositories/ServiceRepository";

export default class DeleteService {
  constructor(private serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
  }

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new Error("Serviço não encontrado.");
    }

    if (service.isActive) {
      throw new Error("Serviço não pode ser excluído.");
    }

    if (service.tenantId !== service.tenantId) {
      throw new Error("Serviço não pertence a este tenant.");
    }

    if (!id) {
      throw new Error("ID do serviço é obrigatório para exclusão.");
    }
    await this.serviceRepository.delete(id);
  }
}
