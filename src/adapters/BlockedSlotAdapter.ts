import { BlockedSlotEntity } from '../core/entities/BlockedSlotEntity';
import { IBlockedSlot } from '../core/interfaces/BlockedSlot';

export default class BlockedSlotAdapter {
  static create(row: IBlockedSlot): BlockedSlotEntity {
    if (!row) throw new Error('Row inválido para criação de BlockedSlotEntity');
    return BlockedSlotEntity.create({
      id: row.id,
      tenantId: row.tenantId,
      staffUserId: row.staffUserId ?? undefined,
      startTime: new Date(row.startTime),
      endTime: new Date(row.endTime),
      reason: row.reason ?? undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }

  static toDb(entity: BlockedSlotEntity) {
    return {
      id: entity.id ?? undefined,
      tenantId: entity.tenantId,
      staffUserId: entity.staffUserId ?? undefined,
      startTime: entity.startTime,
      endTime: entity.endTime,
      reason: entity.reason ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } as Partial<IBlockedSlot>;
  }
}
