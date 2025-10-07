import { AvailabilityEntity } from '../../entities/AvailabilityEntity';
import { IAvailabilityRepository } from '../../repositories/AvailabilityRepository';

export class ListAvailabilities {
  constructor(private availabilityRepository: IAvailabilityRepository) {}

  async execute(tenantId: string): Promise<AvailabilityEntity[]> {
    if (!tenantId) {
      throw new Error('TenantId é obrigatório');
    }

    return await this.availabilityRepository.findByTenantId(tenantId);
  }
}
