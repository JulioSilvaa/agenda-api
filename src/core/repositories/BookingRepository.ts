import { BookingEntity } from '../entities/BookingEntity';

export interface IBookingRepository {
  create(booking: BookingEntity): Promise<BookingEntity>;
  update(booking: BookingEntity): Promise<BookingEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BookingEntity | null>;
}
