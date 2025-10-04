export interface IBlockedSlot {
  id: string;
  tenantId: string;
  staffUserId?: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
