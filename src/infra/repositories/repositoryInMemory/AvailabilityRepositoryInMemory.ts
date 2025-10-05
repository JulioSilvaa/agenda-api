import { AvailabilityEntity } from '../../../core/entities/AvailabilityEntity';
import { IAvailabilityRepository } from '../../../core/repositories/AvailabilityRepository';

export class AvailabilityRepositoryInMemory implements IAvailabilityRepository {
  private availabilities: AvailabilityEntity[] = [];

  async create(availability: AvailabilityEntity): Promise<AvailabilityEntity> {
    this.availabilities.push(availability);
    return availability;
  }

  async update(availability: AvailabilityEntity): Promise<AvailabilityEntity> {
    const index = this.availabilities.findIndex(a => a.id === availability.id);
    if (index === -1) {
      throw new Error('Disponibilidade não encontrada');
    }
    this.availabilities[index] = availability;
    return availability;
  }

  async delete(id: string): Promise<void> {
    this.availabilities = this.availabilities.filter(a => a.id !== id);
  }

  async findById(id: string): Promise<AvailabilityEntity | null> {
    const availability = this.availabilities.find(a => a.id === id);
    return availability ? availability : null;
  }

  async findByTenantId(tenantId: string): Promise<AvailabilityEntity[]> {
    return this.availabilities.filter(a => a.tenantId === tenantId);
  }

  async findByWeekday(weekday: number, tenantId: string): Promise<AvailabilityEntity[]> {
    return this.availabilities.filter(a => a.weekday === weekday && a.tenantId === tenantId);
  }

  async findConflictingSlots(
    tenantId: string,
    weekday: number,
    startTime: string,
    endTime: string
  ): Promise<AvailabilityEntity[]> {
    return this.availabilities.filter(a => {
      if (a.tenantId !== tenantId || a.weekday !== weekday) {
        return false;
      }

      // Verifica se há sobreposição de horários
      // Dois intervalos se sobrepõem se: startTime1 < endTime2 AND endTime1 > startTime2
      const hasOverlap = startTime < a.endTime && endTime > a.startTime;
      return hasOverlap;
    });
  }
}
