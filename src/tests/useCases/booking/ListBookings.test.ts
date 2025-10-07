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
import ListBookings from './../../../core/useCases/booking/List';

describe('Unit test ListBookings UseCase', () => {
  let bookingRepository: BookingRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let customerRepository: CustomerRepositoryInMemory;
  let serviceRepository: ServiceRepositoryInMemory;
  let createBooking: CreateBooking;
  let createTenant: CreateTenant;
  let createCustomer: CreateCustomer;
  let createService: CreateService;
  let listBookings: ListBookings;
  let tenantId: string;
  let tenant2Id: string;
  let customerId: string;
  let serviceId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    password: 'Senha#123',
    isActive: true,
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
    requestedStart: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã 10:00
    requestedEnd: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // amanhã 10:30
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
    listBookings = new ListBookings(bookingRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);
    createCustomer = new CreateCustomer(customerRepository, tenantRepository);
    createService = new CreateService(serviceRepository, tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: 'salao2@example.com',
      slug: 'salao-2',
      password: 'Senha#123',
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

  describe('Successful Listing', () => {
    test('should list all bookings for a tenant', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(15, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });

      const bookings = await listBookings.execute(tenantId);

      expect(bookings).toHaveLength(3);
    });

    test('should return empty array when tenant has no bookings', async () => {
      const bookings = await listBookings.execute(tenantId);
      expect(bookings).toHaveLength(0);
      expect(Array.isArray(bookings)).toBe(true);
    });

    test('should list bookings by status', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.PENDING,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(15, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CANCELLED,
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });
    });

    test('should list bookings by customer', async () => {
      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'outro@example.com',
        phone: '11977777777',
      });

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(15, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId: customer2.id!,
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });
    });

    test('should list bookings by service', async () => {
      const service2 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Barba',
      });

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId: service2.id!,
        requestedStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(15, 0, 0, 0)),
      });
    });

    test('should list bookings by staff user', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: 'staff-123',
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: 'staff-123',
        requestedStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(15, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: 'staff-456',
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });
    });
  });

  describe('Tenant Isolation', () => {
    test('should not list bookings from other tenants', async () => {
      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        email: 'outro@example.com',
        phone: '11977777777',
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
      });

      await createBooking.execute({
        ...validBooking,
        tenantId: tenant2Id,
        customerId: customer2.id!,
      });
    });

    test('should return independent lists for different tenants', async () => {
      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        email: 'outro@example.com',
        phone: '11977777777',
      });

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId: tenant2Id,
        customerId: customer2.id!,
        requestedStart: new Date(tomorrow.setHours(14, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(15, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId: tenant2Id,
        customerId: customer2.id!,
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });
    });
  });

  describe('Sorting and Ordering', () => {
    test('should list bookings ordered by date', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(threeDays.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(threeDays.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });
    });

    test('should filter bookings by date range', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const afterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const fourDays = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(afterTomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(afterTomorrow.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(threeDays.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(threeDays.setHours(11, 0, 0, 0)),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date(fourDays.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(fourDays.setHours(11, 0, 0, 0)),
      });

      const bookings = await listBookings.execute(tenantId, {
        startDate: new Date(afterTomorrow.setHours(0, 0, 0, 0)),
        endDate: new Date(threeDays.setHours(23, 59, 59, 999)),
      });

      expect(bookings).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    test('should preserve all booking properties', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date(tomorrow.setHours(10, 0, 0, 0)),
        requestedEnd: new Date(tomorrow.setHours(11, 0, 0, 0)),
        notes: 'Teste',
      });
    });

    test('should handle large number of bookings', async () => {
      for (let i = 0; i < 20; i++) {
        const futureDay = new Date(Date.now() + (1 + i) * 24 * 60 * 60 * 1000);
        await createBooking.execute({
          ...validBooking,
          tenantId,
          customerId,
          requestedStart: new Date(futureDay.setHours(10, 0, 0, 0)),
          requestedEnd: new Date(futureDay.setHours(11, 0, 0, 0)),
        });
      }
    });
  });
});
