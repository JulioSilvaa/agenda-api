import { AvailabilityEntity } from '../../entities/AvailabilityEntity';
import { AppError } from '../../errors/AppError';
import { IAvailability } from '../../interfaces/Availability';

export default class UpdateAvailability {
  constructor(
    private availabilityRepository: any,
    private tenantRepository: any
  ) {}

  async execute(
    data: Partial<IAvailability> & { id: string; tenantId: string }
  ): Promise<AvailabilityEntity> {
    // Buscar disponibilidade existente
    const current = await this.availabilityRepository.findById(data.id);
    if (!current) {
      throw new AppError('Disponibilidade não encontrada');
    }

    // Validar tenant
    if (current.tenantId !== data.tenantId) {
      throw new AppError('Disponibilidade não pertence a este tenant');
    }

    // Montar objeto atualizado
    const updated: IAvailability = {
      ...current,
      ...data,
      updatedAt: new Date(),
    };

    // Validar entidade
    let entity: AvailabilityEntity;
    try {
      entity = AvailabilityEntity.create(updated);
    } catch (err: any) {
      throw new AppError(err.message);
    }

    // Validar conflito de horários
    const allAvailabilities = await this.availabilityRepository.findByWeekday(
      entity.weekday,
      entity.tenantId
    );
    const hasConflict = allAvailabilities.some((a: AvailabilityEntity) => {
      if (a.id === entity.id) return false;
      // Verifica se há sobreposição de horários
      return entity.startTime < a.endTime && entity.endTime > a.startTime;
    });
    if (hasConflict) {
      throw new AppError('Já existe disponibilidade neste horário para este dia da semana');
    }

    // Persistir
    await this.availabilityRepository.update(entity);
    return entity;
  }
}
