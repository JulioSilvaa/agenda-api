import crypto from 'crypto';

import { BlockedSlotEntity } from '../../entities/BlockedSlotEntity';
import { IBlockedSlot } from '../../interfaces/BlockedSlot';
import { IBlockedSlotRepository } from '../../repositories/BlockedSlotRepository';
import { ITenantRepository } from '../../repositories/TenantRepository';

export class CreateBlockedSlot {
  private readonly blockedSlotRepository: IBlockedSlotRepository;
  private readonly tenantRepository: ITenantRepository;

  constructor(blockedSlotRepository: IBlockedSlotRepository, tenantRepository: ITenantRepository) {
    this.blockedSlotRepository = blockedSlotRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(
    data: Omit<IBlockedSlot, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BlockedSlotEntity> {
    // Validar se o tenant existe
    const tenantExists = await this.tenantRepository.findById(data.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant não encontrado');
    }

    // Validar se não há conflito com bloqueios existentes
    const conflictingSlots = await this.blockedSlotRepository.findByTimeRange(
      data.tenantId,
      data.startTime,
      data.endTime,
      data.staffUserId
    );

    if (conflictingSlots.length > 0) {
      throw new Error('Já existe um bloqueio neste período');
    }

    // Criar bloqueio
    const blockedSlotData: IBlockedSlot = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const blockedSlot = BlockedSlotEntity.create(blockedSlotData);
    return await this.blockedSlotRepository.create(blockedSlot);
  }
}
