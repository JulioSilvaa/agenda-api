import { BlockedSlotEntity } from '../../entities/BlockedSlotEntity';
import { IBlockedSlotRepository } from '../../repositories/BlockedSlotRepository';

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

  async execute(filters: FindBlockedSlotsFilters): Promise<BlockedSlotEntity[]> {
    const allSlots = await this.blockedSlotRepository.findAll();
    const filtered = allSlots.filter(slot => {
      if (slot.tenantId !== filters.tenantId) return false;
      // staffUserId: só filtra se for diferente de undefined E diferente de null
      if (
        filters.staffUserId !== undefined &&
        filters.staffUserId !== null &&
        slot.staffUserId !== filters.staffUserId
      )
        return false;
      // Sempre aplica filtro de sobreposição se ambos startTime/endTime forem fornecidos
      if (filters.startTime && filters.endTime) {
        // Sobreposição exclusiva usando timestamp
        return (
          slot.startTime.getTime() < filters.endTime.getTime() &&
          slot.endTime.getTime() > filters.startTime.getTime()
        );
      }
      return true;
    });
    // console.log("BlockedSlots filtrados:", filtered);
    return filtered;
  }
}
