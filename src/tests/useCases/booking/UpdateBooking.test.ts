import { describe, expect, test, beforeEach } from 'vitest';
import { BookingRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/BookingRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CustomerRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory';
import { ServiceRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory';
import { CreateBooking } from '../../../core/useCases/booking/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import { CreateService } from '../../../core/useCases/service/Create';
import { BookingStatus } from '../../../core/interfaces/Booking';
// import { UpdateBooking } from '../../../core/useCases/booking/Update'; // TODO: Implementar

describe.skip('Unit test UpdateBooking UseCase', () => {
  let bookingRepository: BookingRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let customerRepository: CustomerRepositoryInMemory;
  let serviceRepository: ServiceRepositoryInMemory;
  let createBooking: CreateBooking;
  let createTenant: CreateTenant;
  let createCustomer: CreateCustomer;
  let createService: CreateService;
  // let updateBooking: UpdateBooking; // TODO: Implementar
  let tenantId: string;
  let customerId: string;
  let serviceId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
    password: 'Senha#123',
  };

  const validCustomer = {
    name: 'João da Silva',
    email: 'joao@example.com',
    phone: '11988888888',
    isActive: true,
    totalBookings: 0,
  };

  const validService = {
    name: 'Corte de Cabelo',
    description: 'Corte masculino',
    price: 50.0,
    durationMinutes: 30,
    isActive: true,
  };

  const validBooking = {
    status: BookingStatus.PENDING,
    requestedStart: new Date('2025-10-06T10:00:00'),
    requestedEnd: new Date('2025-10-06T10:30:00'),
  };

  beforeEach(async () => {
    bookingRepository = new BookingRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    customerRepository = new CustomerRepositoryInMemory();
    serviceRepository = new ServiceRepositoryInMemory();
    createBooking = new CreateBooking(
      bookingRepository,
      tenantRepository,
      customerRepository,
      serviceRepository
    );
    // updateBooking = new UpdateBooking(bookingRepository, tenantRepository, customerRepository, serviceRepository); // TODO: Implementar
    createTenant = new CreateTenant(tenantRepository);
    createCustomer = new CreateCustomer(customerRepository, tenantRepository);
    createService = new CreateService(serviceRepository, tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const customer = await createCustomer.execute({
      ...validCustomer,
      tenantId,
    });
    customerId = customer.id!;

    const service = await createService.execute({
      ...validService,
      tenantId,
    });
    serviceId = service.id!;
  });

  describe('Successful Update', () => {
    test('should update booking status', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId: booking.customerId,
      //   serviceId: booking.serviceId,
      //   status: BookingStatus.CONFIRMED,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      // });

      // expect(updated.status).toBe(BookingStatus.CONFIRMED);
      // expect(updated.updatedAt.getTime()).toBeGreaterThan(booking.createdAt.getTime());
    });

    test('should update booking time', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId: booking.customerId,
      //   serviceId: booking.serviceId,
      //   status: booking.status,
      //   requestedStart: new Date('2025-10-06T14:00:00'),
      //   requestedEnd: new Date('2025-10-06T15:00:00'),
      // });

      // expect(updated.requestedStart).toEqual(new Date('2025-10-06T14:00:00'));
      // expect(updated.requestedEnd).toEqual(new Date('2025-10-06T15:00:00'));
    });

    test('should update booking notes', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId: booking.customerId,
      //   serviceId: booking.serviceId,
      //   status: booking.status,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      //   notes: 'Notas atualizadas',
      // });

      // expect(updated.notes).toBe('Notas atualizadas');
    });

    test('should update booking rating', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.COMPLETED,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId: booking.customerId,
      //   serviceId: booking.serviceId,
      //   status: booking.status,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      //   rating: 5,
      // });

      // expect(updated.rating).toBe(5);
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when booking does not exist', async () => {
      // await expect(() =>
      //   updateBooking.execute({
      //     id: 'non-existent-id',
      //     tenantId,
      //     customerId,
      //     serviceId,
      //     status: BookingStatus.CONFIRMED,
      //     requestedStart: new Date(),
      //     requestedEnd: new Date(),
      //   })
      // ).rejects.toThrow('Agendamento não encontrado');
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to update booking from different tenant', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'outro@example.com',
        slug: 'outro',
      });

      // await expect(() =>
      //   updateBooking.execute({
      //     id: booking.id!,
      //     tenantId: tenant2.id!,
      //     customerId: booking.customerId,
      //     serviceId: booking.serviceId,
      //     status: booking.status,
      //     requestedStart: booking.requestedStart,
      //     requestedEnd: booking.requestedEnd,
      //   })
      // ).rejects.toThrow('Agendamento não pertence a este tenant');
    });
  });

  describe('Time Conflict Validation', () => {
    test('should throw error when updating to conflicting time', async () => {
      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      // await expect(() =>
      //   updateBooking.execute({
      //     id: booking1.id!,
      //     tenantId,
      //     customerId,
      //     serviceId,
      //     staffUserId: 'staff-123',
      //     status: booking1.status,
      //     requestedStart: new Date('2025-10-06T14:30:00'),
      //     requestedEnd: new Date('2025-10-06T15:30:00'),
      //   })
      // ).rejects.toThrow('Já existe um agendamento neste horário');
    });

    test('should allow update with same time (no conflict with itself)', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId,
      //   serviceId,
      //   status: BookingStatus.CONFIRMED,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      // });

      // expect(updated.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  describe('Status Transition Validation', () => {
    test('should allow transition from PENDING to CONFIRMED', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.PENDING,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId,
      //   serviceId,
      //   status: BookingStatus.CONFIRMED,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      // });

      // expect(updated.status).toBe(BookingStatus.CONFIRMED);
    });

    test('should allow transition from CONFIRMED to COMPLETED', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CONFIRMED,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId,
      //   serviceId,
      //   status: BookingStatus.COMPLETED,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      // });

      // expect(updated.status).toBe(BookingStatus.COMPLETED);
    });

    test('should allow cancellation from any status', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CONFIRMED,
      });

      // const updated = await updateBooking.execute({
      //   id: booking.id!,
      //   tenantId,
      //   customerId,
      //   serviceId,
      //   status: BookingStatus.CANCELLED,
      //   requestedStart: booking.requestedStart,
      //   requestedEnd: booking.requestedEnd,
      // });

      // expect(updated.status).toBe(BookingStatus.CANCELLED);
    });
  });
});
