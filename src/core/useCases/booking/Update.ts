import { BookingEntity } from '../../entities/BookingEntity';
import { AppError } from '../../errors/AppError';
import { IBookingRepository } from '../../repositories/BookingRepository';

interface IBookingRepositoryExtended extends IBookingRepository {
  findConflictingBookings?(
    tenantId: string,
    requestedStart: Date,
    requestedEnd: Date,
    staffUserId: string
  ): Promise<BookingEntity[]>;
}

export default class UpdateBooking {
  constructor(private bookingRepository: IBookingRepositoryExtended) {
    this.bookingRepository = bookingRepository;
  }
  async execute(booking: BookingEntity): Promise<BookingEntity> {
    try {
      const existingBooking = await this.bookingRepository.findById(booking.id!);
      if (!existingBooking) throw new AppError('Agendamento não encontrado', 404);

      // Validação de conflito de horário (apenas se houver staffUserId e implementação do método)
      let conflicts: BookingEntity[] = [];
      if (booking.staffUserId && this.bookingRepository.findConflictingBookings) {
        conflicts = await this.bookingRepository.findConflictingBookings(
          booking.tenantId,
          booking.requestedStart,
          booking.requestedEnd,
          booking.staffUserId
        );
      }
      // Remove o próprio booking da lista de conflitos
      const hasConflict = conflicts.some((b: BookingEntity) => b.id !== booking.id);
      if (hasConflict) {
        throw new AppError('Já existe um agendamento neste horário', 400);
      }

      return await this.bookingRepository.update(booking);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar agendamento', 500);
    }
  }
}
