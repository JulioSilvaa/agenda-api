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
// import { DeleteBooking } from '../../../core/useCases/booking/Delete'; // TODO: Implementar

describe.skip('Unit test DeleteBooking UseCase', () => {
  let bookingRepository: BookingRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let customerRepository: CustomerRepositoryInMemory;
  let serviceRepository: ServiceRepositoryInMemory;
  let createBooking: CreateBooking;
  let createTenant: CreateTenant;
  let createCustomer: CreateCustomer;
  let createService: CreateService;
  // let deleteBooking: DeleteBooking; // TODO: Implementar
  let tenantId: string;
  let tenant2Id: string;
  let customerId: string;
  let serviceId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    isActive: true,
    password: 'Senha#123',
    address: 'Rua Teste, 123',
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
    // deleteBooking = new DeleteBooking(bookingRepository); // TODO: Implementar
    createTenant = new CreateTenant(tenantRepository);
    createCustomer = new CreateCustomer(customerRepository, tenantRepository);
    createService = new CreateService(serviceRepository, tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: 'salao2@example.com',
      slug: 'salao-2',
      password: '',
    });
    tenant2Id = tenant2.id!;

    const customer = await createCustomer.execute({
      ...validCustomer,
      tenantId,
      totalBookings: 0,
    });
    customerId = customer.id!;

    const service = await createService.execute({
      ...validService,
      tenantId,
    });
    serviceId = service.id!;
  });

  describe('Successful Deletion', () => {
    test('should delete existing booking', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // await deleteBooking.execute(booking.id!, tenantId);

      // const foundBooking = await bookingRepository.findById(booking.id!);
      // expect(foundBooking).toBeNull();
    });

    test('should remove booking from repository', async () => {
      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      const booking2 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      // await deleteBooking.execute(booking1.id!, tenantId);

      // const allBookings = await bookingRepository.findByTenantId(tenantId);
      // expect(allBookings.length).toBe(1);
      // expect(allBookings[0].id).toBe(booking2.id);
    });

    test('should delete bookings with different statuses', async () => {
      const pendingBooking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.PENDING,
      });

      // await deleteBooking.execute(pendingBooking.id!, tenantId);

      // const found = await bookingRepository.findById(pendingBooking.id!);
      // expect(found).toBeNull();
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when booking does not exist', async () => {
      // await expect(() =>
      //   deleteBooking.execute('non-existent-id', tenantId)
      // ).rejects.toThrow('Agendamento não encontrado');
    });

    test('should throw error for empty id', async () => {
      // await expect(() => deleteBooking.execute('', tenantId)).rejects.toThrow(
      //   'Agendamento não encontrado'
      // );
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to delete booking from different tenant', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // await expect(() =>
      //   deleteBooking.execute(booking.id!, tenant2Id)
      // ).rejects.toThrow('Agendamento não pertence a este tenant');
    });

    test('should throw error for invalid tenant id', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      });

      // await expect(() =>
      //   deleteBooking.execute(booking.id!, 'wrong-tenant')
      // ).rejects.toThrow('Agendamento não pertence a este tenant');
    });
  });

  describe('Edge Cases', () => {
    test('should not affect other tenants bookings', async () => {
      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        email: 'outro@example.com',
        phone: '11977777777',
      });

      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
      });

      const booking2 = await createBooking.execute({
        ...validBooking,
        tenantId: tenant2Id,
        customerId: customer2.id!,
      });

      // await deleteBooking.execute(booking1.id!, tenantId);

      // const found1 = await bookingRepository.findById(booking1.id!);
      // const found2 = await bookingRepository.findById(booking2.id!);

      // expect(found1).toBeNull();
      // expect(found2).toBeDefined();
    });

    test('should handle deletion of already deleted booking', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
      });

      // await deleteBooking.execute(booking.id!, tenantId);

      // await expect(() =>
      //   deleteBooking.execute(booking.id!, tenantId)
      // ).rejects.toThrow('Agendamento não encontrado');
    });

    test('should delete cancelled booking', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CANCELLED,
      });

      // await deleteBooking.execute(booking.id!, tenantId);

      // const foundBooking = await bookingRepository.findById(booking.id!);
      // expect(foundBooking).toBeNull();
    });

    test('should delete completed booking', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.COMPLETED,
      });

      // await deleteBooking.execute(booking.id!, tenantId);

      // const foundBooking = await bookingRepository.findById(booking.id!);
      // expect(foundBooking).toBeNull();
    });

    test('should allow creating booking in same slot after deletion', async () => {
      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      // await deleteBooking.execute(booking.id!, tenantId);

      // const newBooking = await createBooking.execute({
      //   ...validBooking,
      //   tenantId,
      //   customerId,
      //   serviceId,
      //   staffUserId: 'staff-123',
      //   requestedStart: new Date('2025-10-06T10:00:00'),
      //   requestedEnd: new Date('2025-10-06T11:00:00'),
      // });

      // expect(newBooking).toBeDefined();
      // expect(newBooking.id).not.toBe(booking.id);
    });
  });
});
