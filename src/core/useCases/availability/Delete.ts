import { IAvailabilityRepository } from '../../repositories/AvailabilityRepository';

export default class DeleteAvailability {
  constructor(private availabilityRepository: IAvailabilityRepository) {
    this.availabilityRepository = availabilityRepository;
  }

  async execute(id: string, tenantId: string): Promise<void> {
    const availability = await this.availabilityRepository.findById(id);

    if (!availability) {
      throw new Error('Disponibilidade não encontrada');
    }

    if (availability.tenantId !== tenantId) {
      throw new Error('Disponibilidade não pertence a este tenant');
    }

    await this.availabilityRepository.delete(id);
  }
}
