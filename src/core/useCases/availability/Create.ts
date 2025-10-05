import { AvailabilityEntity } from '../../entities/AvailabilityEntity';
import { IAvailability } from '../../interfaces/Availability';
import { IAvailabilityRepository } from '../../repositories/AvailabilityRepository';
import { ITenantRepository } from '../../repositories/TenantRepository';

export class CreateAvailability {
  private readonly availabilityRepository: IAvailabilityRepository;
  private readonly tenantRepository: ITenantRepository;

  constructor(availabilityRepository: IAvailabilityRepository, tenantRepository: ITenantRepository) {
    this.availabilityRepository = availabilityRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(data: Omit<IAvailability, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityEntity> {
    // Validar se o tenant existe
    const tenantExists = await this.tenantRepository.findById(data.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant não encontrado');
    }

    // Validar se há conflito de horários no mesmo dia da semana
    const conflictingSlots = await this.availabilityRepository.findConflictingSlots(
      data.tenantId,
      data.weekday,
      data.startTime,
      data.endTime
    );

    if (conflictingSlots.length > 0) {
      throw new Error('Já existe disponibilidade neste horário para este dia da semana');
    }

    // Criar disponibilidade
    const availabilityData: IAvailability = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const availability = AvailabilityEntity.create(availabilityData);
    return await this.availabilityRepository.create(availability);
  }
}
