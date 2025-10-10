import { BookingEntity } from '../../entities/BookingEntity';
import { AppError } from '../../errors/AppError';
import { IBookingRepository } from '../../repositories/BookingRepository';
import { ITenantRepository } from '../../repositories/TenantRepository';

// Repositório estendido localmente para permitir métodos adicionais usados neste caso de uso
interface IBookingRepositoryExtended extends IBookingRepository {
  findByTenantId?(tenantId: string): Promise<BookingEntity[]>;
}

export default class ListBookings {
  constructor(
    private bookingRepository: IBookingRepositoryExtended,
    private tenantRepository: ITenantRepository
  ) {
    this.bookingRepository = bookingRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(
    tenantId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: string;
      customerId?: string;
      serviceId?: string;
      staffUserId?: string;
    }
  ): Promise<BookingEntity[]> {
    // Busca e valida o tenant
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404);
    }
    if (!(tenant as unknown as { _isActive?: boolean })._isActive) {
      throw new AppError('Tenant inativo', 403);
    }
    // Lista agendamentos do tenant
    if (typeof this.bookingRepository.findByTenantId === 'function') {
      let bookings = await this.bookingRepository.findByTenantId(tenantId);
      // Filtros opcionais
      if (filters) {
        if (filters.startDate || filters.endDate) {
          bookings = bookings.filter((b: BookingEntity) => {
            const start = filters.startDate ? filters.startDate.getTime() : -Infinity;
            const end = filters.endDate ? filters.endDate.getTime() : Infinity;
            return b.requestedStart.getTime() >= start && b.requestedEnd.getTime() <= end;
          });
        }
        if (filters.status) {
          bookings = bookings.filter((b: BookingEntity) => b.status === filters.status);
        }
        if (filters.customerId) {
          bookings = bookings.filter((b: BookingEntity) => b.customerId === filters.customerId);
        }
        if (filters.serviceId) {
          bookings = bookings.filter((b: BookingEntity) => b.serviceId === filters.serviceId);
        }
        if (filters.staffUserId) {
          bookings = bookings.filter((b: BookingEntity) => b.staffUserId === filters.staffUserId);
        }
      }
      return bookings;
    }
    throw new AppError('Método findByTenantId não implementado no BookingRepository', 500);
  }
}
