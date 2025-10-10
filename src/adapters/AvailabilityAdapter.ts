import { AvailabilityEntity } from '../core/entities/AvailabilityEntity';
import { IAvailability } from '../core/interfaces/Availability';

export default class AvailabilityAdapter {
  static create(row: IAvailability): AvailabilityEntity {
    if (!row) throw new Error('Row inválido para criação de AvailabilityEntity');
    return AvailabilityEntity.create({
      id: row.id,
      tenantId: row.tenantId,
      weekday: row.weekday,
      startTime: row.startTime,
      endTime: row.endTime,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }

  static toDb(entity: AvailabilityEntity) {
    return {
      id: entity.id ?? undefined,
      tenantId: entity.tenantId,
      weekday: entity.weekday,
      startTime: entity.startTime,
      endTime: entity.endTime,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as Partial<IAvailability>;
  }
}
