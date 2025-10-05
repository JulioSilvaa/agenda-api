import { AvailabilityEntity } from '../entities/AvailabilityEntity';

export interface IAvailabilityRepository {
  create(availability: AvailabilityEntity): Promise<AvailabilityEntity>;
  update(availability: AvailabilityEntity): Promise<AvailabilityEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AvailabilityEntity | null>;
  findByTenantId(tenantId: string): Promise<AvailabilityEntity[]>;
  findByWeekday(weekday: number, tenantId: string): Promise<AvailabilityEntity[]>;
  findConflictingSlots(tenantId: string, weekday: number, startTime: string, endTime: string): Promise<AvailabilityEntity[]>;
}
