import { BookingEntity } from '../entities/BookingEntity';
import { BookingStatus } from '../interfaces/Booking';

export interface IBookingRepository {
  create(booking: BookingEntity): Promise<BookingEntity>;
  update(booking: BookingEntity): Promise<BookingEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BookingEntity | null>;
  findByTenantId(tenantId: string): Promise<BookingEntity[]>;
  findByCustomerId(customerId: string, tenantId: string): Promise<BookingEntity[]>;
  findByServiceId(serviceId: string, tenantId: string): Promise<BookingEntity[]>;
  findByStaffUserId(staffUserId: string, tenantId: string): Promise<BookingEntity[]>;
  findByStatus(status: BookingStatus, tenantId: string): Promise<BookingEntity[]>;
  findConflictingBookings(
    tenantId: string,
    requestedStart: Date,
    requestedEnd: Date,
    staffUserId?: string
  ): Promise<BookingEntity[]>;
}
