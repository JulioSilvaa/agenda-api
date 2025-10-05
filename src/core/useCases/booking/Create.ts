import crypto from 'crypto';

import { BookingEntity } from '../../entities/BookingEntity';
import { BookingStatus, IBooking } from '../../interfaces/Booking';
import { IBookingRepository } from '../../repositories/BookingRepository';
import { ICustomerRepository } from '../../repositories/CustomerRepository';
import { IServiceRepository } from '../../repositories/ServiceRepository';
import { ITenantRepository } from '../../repositories/TenantRepository';

export class CreateBooking {
  private readonly bookingRepository: IBookingRepository;
  private readonly tenantRepository: ITenantRepository;
  private readonly customerRepository: ICustomerRepository;
  private readonly serviceRepository: IServiceRepository;

  constructor(
    bookingRepository: IBookingRepository,
    tenantRepository: ITenantRepository,
    customerRepository: ICustomerRepository,
    serviceRepository: IServiceRepository
  ) {
    this.bookingRepository = bookingRepository;
    this.tenantRepository = tenantRepository;
    this.customerRepository = customerRepository;
    this.serviceRepository = serviceRepository;
  }

  async execute(data: Omit<IBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingEntity> {
    // Validar se o tenant existe
    const tenantExists = await this.tenantRepository.findById(data.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant não encontrado');
    }

    // Validar se o customer existe (se fornecido)
    if (data.customerId) {
      const customerExists = await this.customerRepository.findById(data.customerId);
      if (!customerExists) {
        throw new Error('Cliente não encontrado');
      }
      if (customerExists.tenantId !== data.tenantId) {
        throw new Error('Cliente não pertence a este tenant');
      }
    }

    // Validar se o service existe (se fornecido)
    if (data.serviceId) {
      const serviceExists = await this.serviceRepository.findById(data.serviceId);
      if (!serviceExists) {
        throw new Error('Serviço não encontrado');
      }
      if (serviceExists.tenantId !== data.tenantId) {
        throw new Error('Serviço não pertence a este tenant');
      }
    }

    // Validar se há conflito de horários
    const conflictingBookings = await this.bookingRepository.findConflictingBookings(
      data.tenantId,
      data.requestedStart,
      data.requestedEnd,
      data.staffUserId
    );

    if (conflictingBookings.length > 0) {
      throw new Error('Já existe um agendamento neste horário');
    }

    // Criar booking
    const bookingData: IBooking = {
      ...data,
      id: crypto.randomUUID(),
      status: data.status || BookingStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const booking = BookingEntity.create(bookingData);
    return await this.bookingRepository.create(booking);
  }
}
