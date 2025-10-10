import { ServiceEntity } from '../core/entities/ServiceEntity';
import { IService } from '../core/interfaces/Service';

export default class ServiceAdapter {
  static create(row: IService): ServiceEntity {
    if (!row) throw new Error('Row inválido para criação de ServiceEntity');
    return ServiceEntity.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      price: row.price,
      durationMinutes: row.durationMinutes,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }

  static toDb(entity: ServiceEntity) {
    return {
      id: entity.id ?? undefined,
      tenantId: entity.tenantId,
      name: entity.name,
      description: entity.description ?? undefined,
      price: entity.price,
      durationMinutes: entity.durationMinutes,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as Partial<IService>;
  }
}
