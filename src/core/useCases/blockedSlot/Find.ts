import { BlockedSlotEntity } from "../../entities/BlockedSlotEntity";
import { IBlockedSlotRepository } from "../../repositories/BlockedSlotRepository";

export interface FindBlockedSlotsFilters {
  tenantId: string;
  staffUserId?: string;
  startTime?: Date;
  endTime?: Date;
}

export class FindBlockedSlots {
  private readonly blockedSlotRepository: IBlockedSlotRepository;

  constructor(blockedSlotRepository: IBlockedSlotRepository) {
    this.blockedSlotRepository = blockedSlotRepository;
  }

  async execute(
    filters: FindBlockedSlotsFilters
  ): Promise<BlockedSlotEntity[]> {
    const allSlots = await this.blockedSlotRepository.findAll();
    return allSlots.filter((slot) => {
      if (slot.tenantId !== filters.tenantId) return false;
      if (filters.staffUserId && slot.staffUserId !== filters.staffUserId)
        return false;
      if (filters.startTime && filters.endTime) {
        return (
          slot.startTime >= filters.startTime && slot.endTime <= filters.endTime
        );
      }
      return true;
    });
  }
}
