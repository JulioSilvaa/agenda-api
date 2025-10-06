import { BlockedSlotEntity } from "../entities/BlockedSlotEntity";

export interface IBlockedSlotRepository {
  create(blockedSlot: BlockedSlotEntity): Promise<BlockedSlotEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BlockedSlotEntity | null>;
  findAll(): Promise<BlockedSlotEntity[]>;
}
