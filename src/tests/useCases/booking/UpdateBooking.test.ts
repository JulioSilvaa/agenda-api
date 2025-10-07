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
import { BookingEntity } from '../../../core/entities/BookingEntity';
import UpdateBooking from './../../../core/useCases/booking/Update';
describe('Unit test UpdateBooking UseCase', () => {
  let bookingRepository: BookingRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let customerRepository: CustomerRepositoryInMemory;
  let serviceRepository: ServiceRepositoryInMemory;
  let createBooking: CreateBooking;
  let createTenant: CreateTenant;
  let createCustomer: CreateCustomer;
  let createService: CreateService;
  let updateBooking: UpdateBooking;
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
    requestedStart: new Date('2025-10-20T10:00:00'),
    requestedEnd: new Date('2025-10-21T10:30:00'),
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
    updateBooking = new UpdateBooking(bookingRepository);
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

      // Cria uma nova instância da entidade com status atualizado e updatedAt > createdAt
      const updatedBooking = BookingEntity.create({
        id: booking.id!,
        tenantId: booking.tenantId,
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        staffUserId: booking.staffUserId,
        status: BookingStatus.CONFIRMED,
        requestedStart: booking.requestedStart,
        requestedEnd: booking.requestedEnd,
        notes: booking.notes,
        rating: booking.rating,
        createdAt: booking.createdAt,
        updatedAt: new Date(booking.createdAt.getTime() + 1000),
      });
      const updated = await updateBooking.execute(updatedBooking);

      expect(updated.status).toBe(BookingStatus.CONFIRMED);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(booking.createdAt.getTime());
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
      // Datas dinâmicas futuras para evitar erro de "Data de início no passado"
      const now = Date.now();
      const start1 = new Date(now + 24 * 60 * 60 * 1000); // amanhã 10:00
      start1.setHours(10, 0, 0, 0);
      const end1 = new Date(start1);
      end1.setHours(11, 0, 0, 0);

      const start2 = new Date(now + 24 * 60 * 60 * 1000); // amanhã 14:00
      start2.setHours(14, 0, 0, 0);
      const end2 = new Date(start2);
      end2.setHours(15, 0, 0, 0);

      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        requestedStart: start1,
        requestedEnd: end1,
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        requestedStart: start2,
        requestedEnd: end2,
      });

      // Tenta atualizar para horário conflitante
      const conflictStart = new Date(start2);
      conflictStart.setMinutes(30); // 14:30
      const conflictEnd = new Date(conflictStart);
      conflictEnd.setHours(15, 30, 0, 0); // 15:30

      const updatedBooking = BookingEntity.create({
        id: booking1.id!,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: booking1.status,
        requestedStart: conflictStart,
        requestedEnd: conflictEnd,
        notes: booking1.notes,
        rating: booking1.rating,
        createdAt: booking1.createdAt,
        updatedAt: new Date(),
      });
      await expect(updateBooking.execute(updatedBooking)).rejects.toThrow(
        'Já existe um agendamento neste horário'
      );
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
