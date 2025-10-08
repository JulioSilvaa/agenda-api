import { BlockedSlotEntity } from '../../../core/entities/BlockedSlotEntity';
import { IBlockedSlotRepository } from '../../../core/repositories/BlockedSlotRepository';

export class BlockedSlotRepositoryInMemory implements IBlockedSlotRepository {
  async findByStaffUserId(staffUserId: string, tenantId: string): Promise<BlockedSlotEntity[]> {
    return this.blockedSlots.filter(
      slot => slot.staffUserId === staffUserId && slot.tenantId === tenantId
    );
  }
  private blockedSlots: BlockedSlotEntity[] = [];

  async findAll(): Promise<BlockedSlotEntity[]> {
    return this.blockedSlots;
  }

  async create(blockedSlot: BlockedSlotEntity): Promise<BlockedSlotEntity> {
    this.blockedSlots.push(blockedSlot);
    return blockedSlot;
  }

  async delete(id: string): Promise<void> {
    this.blockedSlots = this.blockedSlots.filter(slot => slot.id !== id);
  }

  async findById(id: string): Promise<BlockedSlotEntity | null> {
    const slot = this.blockedSlots.find(s => s.id === id);
    return slot ? slot : null;
  }

  async findByTenantId(tenantId: string): Promise<BlockedSlotEntity[]> {
    return this.blockedSlots.filter(slot => slot.tenantId === tenantId);
  }

  // Removido método duplicado findByStaffUserId
  async findByTimeRange(
    tenantId: string,
    startTime: Date,
    endTime: Date,
    staffUserId?: string
  ): Promise<BlockedSlotEntity[]> {
    return this.blockedSlots.filter(slot => {
      if (slot.tenantId !== tenantId) return false;
      if (staffUserId !== undefined && staffUserId !== null && slot.staffUserId !== staffUserId)
        return false;
      // Lógica de sobreposição exclusiva
      return slot.startTime < endTime && slot.endTime > startTime;
    });
  }
}
