import { BlockedSlotEntity } from '../../../core/entities/BlockedSlotEntity';
import { IBlockedSlotRepository } from '../../../core/repositories/BlockedSlotRepository';

export class BlockedSlotRepositoryInMemory implements IBlockedSlotRepository {
  private blockedSlots: BlockedSlotEntity[] = [];

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

  async findByStaffUserId(staffUserId: string, tenantId: string): Promise<BlockedSlotEntity[]> {
    return this.blockedSlots.filter(
      slot => slot.staffUserId === staffUserId && slot.tenantId === tenantId
    );
  }

  async findByTimeRange(
    tenantId: string,
    startTime: Date,
    endTime: Date,
    staffUserId?: string
  ): Promise<BlockedSlotEntity[]> {
    return this.blockedSlots.filter(slot => {
      // Filtrar por tenant
      if (slot.tenantId !== tenantId) return false;

      // Filtrar por staff se fornecido
      if (staffUserId && slot.staffUserId !== staffUserId && slot.staffUserId !== null) {
        return false;
      }

      // Verificar se há overlap de tempo
      // Overlap ocorre se: startTime < slot.endTime && endTime > slot.startTime
      const hasOverlap = startTime < slot.endTime && endTime > slot.startTime;

      return hasOverlap;
    });
  }
}
