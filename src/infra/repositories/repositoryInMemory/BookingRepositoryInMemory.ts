import { BookingEntity } from '../../../core/entities/BookingEntity';
import { IBookingRepository } from '../../../core/repositories/BookingRepository';
import { BookingStatus } from '../../../core/interfaces/Booking';

export class BookingRepositoryInMemory implements IBookingRepository {
  private bookings: BookingEntity[] = [];

  async create(booking: BookingEntity): Promise<BookingEntity> {
    this.bookings.push(booking);
    return booking;
  }

  async update(booking: BookingEntity): Promise<BookingEntity> {
    const index = this.bookings.findIndex(b => b.id === booking.id);
    if (index === -1) {
      throw new Error('Agendamento não encontrado');
    }
    this.bookings[index] = booking;
    return booking;
  }

  async delete(id: string): Promise<void> {
    this.bookings = this.bookings.filter(b => b.id !== id);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = this.bookings.find(b => b.id === id);
    return booking ? booking : null;
  }

  async findByTenantId(tenantId: string): Promise<BookingEntity[]> {
    return this.bookings.filter(b => b.tenantId === tenantId);
  }

  async findByCustomerId(customerId: string, tenantId: string): Promise<BookingEntity[]> {
    return this.bookings.filter(b => b.customerId === customerId && b.tenantId === tenantId);
  }

  async findByServiceId(serviceId: string, tenantId: string): Promise<BookingEntity[]> {
    return this.bookings.filter(b => b.serviceId === serviceId && b.tenantId === tenantId);
  }

  async findByStaffUserId(staffUserId: string, tenantId: string): Promise<BookingEntity[]> {
    return this.bookings.filter(b => b.staffUserId === staffUserId && b.tenantId === tenantId);
  }

  async findByStatus(status: BookingStatus, tenantId: string): Promise<BookingEntity[]> {
    return this.bookings.filter(b => b.status === status && b.tenantId === tenantId);
  }

  async findConflictingBookings(
    tenantId: string,
    requestedStart: Date,
    requestedEnd: Date,
    staffUserId?: string
  ): Promise<BookingEntity[]> {
    return this.bookings.filter(b => {
      if (b.tenantId !== tenantId) {
        return false;
      }

      // Apenas considera conflito se for para o mesmo staff (quando fornecido)
      if (staffUserId && b.staffUserId !== staffUserId) {
        return false;
      }

      // Ignora bookings cancelados
      if (b.status === BookingStatus.CANCELLED) {
        return false;
      }

      // Verifica se há sobreposição de horários
      const hasOverlap = requestedStart < b.requestedEnd && requestedEnd > b.requestedStart;
      return hasOverlap;
    });
  }
}
