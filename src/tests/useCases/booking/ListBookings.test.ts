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
// import { ListBookings } from '../../../core/useCases/booking/List'; // TODO: Implementar

describe.skip('Unit test ListBookings UseCase', () => {
  let bookingRepository: BookingRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let customerRepository: CustomerRepositoryInMemory;
  let serviceRepository: ServiceRepositoryInMemory;
  let createBooking: CreateBooking;
  let createTenant: CreateTenant;
  let createCustomer: CreateCustomer;
  let createService: CreateService;
  // let listBookings: ListBookings; // TODO: Implementar
  let tenantId: string;
  let tenant2Id: string;
  let customerId: string;
  let serviceId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salão-beleza',
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
    // listBookings = new ListBookings(bookingRepository); // TODO: Implementar
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

  describe('Successful Listing', () => {
    test('should list all bookings for a tenant', async () => {
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      // const bookings = await listBookings.execute(tenantId);

      // expect(bookings).toHaveLength(3);
    });

    test('should return empty array when tenant has no bookings', async () => {
      // const bookings = await listBookings.execute(tenantId);
      // expect(bookings).toHaveLength(0);
      // expect(Array.isArray(bookings)).toBe(true);
    });

    test('should list bookings by status', async () => {
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CANCELLED,
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      // const pendingBookings = await listBookings.execute(tenantId, { status: BookingStatus.PENDING });

      // expect(pendingBookings).toHaveLength(1);
      // expect(pendingBookings[0].status).toBe(BookingStatus.PENDING);
    });

    test('should list bookings by customer', async () => {
      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'outro@example.com',
        phone: '11977777777',
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId: customer2.id!,
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      // const customerBookings = await listBookings.execute(tenantId, { customerId });

      // expect(customerBookings).toHaveLength(2);
      // expect(customerBookings[0].customerId).toBe(customerId);
      // expect(customerBookings[1].customerId).toBe(customerId);
    });

    test('should list bookings by service', async () => {
      const service2 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Barba',
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId: service2.id!,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      // const serviceBookings = await listBookings.execute(tenantId, { serviceId });

      // expect(serviceBookings).toHaveLength(1);
      // expect(serviceBookings[0].serviceId).toBe(serviceId);
    });

    test('should list bookings by staff user', async () => {
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: 'staff-123',
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: 'staff-123',
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: 'staff-456',
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      // const staffBookings = await listBookings.execute(tenantId, { staffUserId: 'staff-123' });

      // expect(staffBookings).toHaveLength(2);
      // expect(staffBookings[0].staffUserId).toBe('staff-123');
      // expect(staffBookings[1].staffUserId).toBe('staff-123');
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

      // const bookings = await listBookings.execute(tenantId);

      // expect(bookings).toHaveLength(1);
      // expect(bookings[0].tenantId).toBe(tenantId);
    });

    test('should return independent lists for different tenants', async () => {
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
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId: tenant2Id,
        customerId: customer2.id!,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId: tenant2Id,
        customerId: customer2.id!,
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      // const tenant1Bookings = await listBookings.execute(tenantId);
      // const tenant2Bookings = await listBookings.execute(tenant2Id);

      // expect(tenant1Bookings).toHaveLength(1);
      // expect(tenant2Bookings).toHaveLength(2);
    });
  });

  describe('Sorting and Ordering', () => {
    test('should list bookings ordered by date', async () => {
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-08T10:00:00'),
        requestedEnd: new Date('2025-10-08T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      // const bookings = await listBookings.execute(tenantId, { sortBy: 'date' });

      // expect(bookings[0].requestedStart).toEqual(new Date('2025-10-06T10:00:00'));
      // expect(bookings[1].requestedStart).toEqual(new Date('2025-10-07T10:00:00'));
      // expect(bookings[2].requestedStart).toEqual(new Date('2025-10-08T10:00:00'));
    });

    test('should filter bookings by date range', async () => {
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-05T10:00:00'),
        requestedEnd: new Date('2025-10-05T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-07T10:00:00'),
        requestedEnd: new Date('2025-10-07T11:00:00'),
      });

      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date('2025-10-08T10:00:00'),
        requestedEnd: new Date('2025-10-08T11:00:00'),
      });

      // const bookings = await listBookings.execute(tenantId, {
      //   startDate: new Date('2025-10-06T00:00:00'),
      //   endDate: new Date('2025-10-07T23:59:59'),
      // });

      // expect(bookings).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    test('should preserve all booking properties', async () => {
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        notes: 'Teste',
      });

      // const bookings = await listBookings.execute(tenantId);

      // expect(bookings[0].customerId).toBe(customerId);
      // expect(bookings[0].serviceId).toBe(serviceId);
      // expect(bookings[0].staffUserId).toBe('staff-123');
      // expect(bookings[0].status).toBe(BookingStatus.CONFIRMED);
      // expect(bookings[0].notes).toBe('Teste');
      // expect(bookings[0].createdAt).toBeInstanceOf(Date);
      // expect(bookings[0].updatedAt).toBeInstanceOf(Date);
    });

    test('should handle large number of bookings', async () => {
      for (let i = 0; i < 20; i++) {
        await createBooking.execute({
          ...validBooking,
          tenantId,
          customerId,
          requestedStart: new Date(`2025-10-${String(6 + i).padStart(2, '0')}T10:00:00`),
          requestedEnd: new Date(`2025-10-${String(6 + i).padStart(2, '0')}T11:00:00`),
        });
      }

      // const bookings = await listBookings.execute(tenantId);

      // expect(bookings).toHaveLength(20);
    });
  });
});
