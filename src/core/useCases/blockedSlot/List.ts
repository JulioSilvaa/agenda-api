import { BlockedSlotEntity } from '../../entities/BlockedSlotEntity';
import { IBlockedSlotRepository } from '../../repositories/BlockedSlotRepository';

export interface ListBlockedSlotsFilters {
  tenantId: string;
  staffUserId?: string;
  startTime?: Date;
  endTime?: Date;
}

export class ListBlockedSlots {
  private readonly blockedSlotRepository: IBlockedSlotRepository;

  constructor(blockedSlotRepository: IBlockedSlotRepository) {
    this.blockedSlotRepository = blockedSlotRepository;
  }

  async execute(filters: ListBlockedSlotsFilters): Promise<BlockedSlotEntity[]> {
    // Se tem filtro de período, busca por range
    if (filters.startTime && filters.endTime) {
      return await this.blockedSlotRepository.findByTimeRange(
        filters.tenantId,
        filters.startTime,
        filters.endTime,
        filters.staffUserId
      );
    }

    // Se tem filtro de staff, busca por staff
    if (filters.staffUserId) {
      return await this.blockedSlotRepository.findByStaffUserId(
        filters.staffUserId,
        filters.tenantId
      );
    }

    // Se não, busca todos do tenant
    return await this.blockedSlotRepository.findByTenantId(filters.tenantId);
  }
}
