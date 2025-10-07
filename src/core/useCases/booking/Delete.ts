import { AppError } from '../../errors/AppError';
import { IBookingRepository } from '../../repositories/BookingRepository';

export default class DeleteBooking {
  constructor(private bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }
  async execute(bookingId: string, tenantId: string): Promise<void> {
    const existingBooking = await this.bookingRepository.findById(bookingId);
    if (!existingBooking) {
      throw new AppError('Agendamento não encontrado', 404);
    }
    if (existingBooking.tenantId !== tenantId) {
      throw new AppError('Agendamento não pertence a este tenant', 403);
    }
    await this.bookingRepository.delete(bookingId);
  }
}
