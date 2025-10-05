import { IBlockedSlotRepository } from '../../repositories/BlockedSlotRepository';

export class DeleteBlockedSlot {
  private readonly blockedSlotRepository: IBlockedSlotRepository;

  constructor(blockedSlotRepository: IBlockedSlotRepository) {
    this.blockedSlotRepository = blockedSlotRepository;
  }

  async execute(id: string, tenantId: string): Promise<void> {
    // Validar se o bloqueio existe
    const blockedSlot = await this.blockedSlotRepository.findById(id);

    if (!blockedSlot) {
      throw new Error('Bloqueio não encontrado');
    }

    // Validar se o bloqueio pertence ao tenant
    if (blockedSlot.tenantId !== tenantId) {
      throw new Error('Bloqueio não pertence a este tenant');
    }

    await this.blockedSlotRepository.delete(id);
  }
}
