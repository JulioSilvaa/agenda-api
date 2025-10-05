import { BlockedSlotEntity } from '../entities/BlockedSlotEntity';

export interface IBlockedSlotRepository {
  create(blockedSlot: BlockedSlotEntity): Promise<BlockedSlotEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BlockedSlotEntity | null>;
  findByTenantId(tenantId: string): Promise<BlockedSlotEntity[]>;
  findByStaffUserId(staffUserId: string, tenantId: string): Promise<BlockedSlotEntity[]>;
  findByTimeRange(
    tenantId: string,
    startTime: Date,
    endTime: Date,
    staffUserId?: string
  ): Promise<BlockedSlotEntity[]>;
}
