import { describe, expect, test, beforeEach } from "vitest";
import { BookingRepositoryInMemory } from "../../../infra/repositories/repositoryInMemory/BookingRepositoryInMemory";
import { TenantRepositoryInMemory } from "../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory";
import { CustomerRepositoryInMemory } from "../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory";
import { ServiceRepositoryInMemory } from "../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory";
import { CreateBooking } from "../../../core/useCases/booking/Create";
import { CreateTenant } from "../../../core/useCases/tenant/Create";
import { CreateCustomer } from "../../../core/useCases/customer/Create";
import { CreateService } from "../../../core/useCases/service/Create";
import { BookingStatus } from "../../../core/interfaces/Booking";

describe("Unit test CreateBooking UseCase", () => {
  let bookingRepository: BookingRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let customerRepository: CustomerRepositoryInMemory;
  let serviceRepository: ServiceRepositoryInMemory;
  let createBooking: CreateBooking;
  let createTenant: CreateTenant;
  let createCustomer: CreateCustomer;
  let createService: CreateService;
  let tenantId: string;
  let customerId: string;
  let serviceId: string;

  const validTenant = {
    name: "Salão de Beleza",
    email: "salao@example.com",
    slug: "salao-beleza",
    phone: "11999999999",
    password: "Senha#123",
    isActive: true,
    address: "Rua Teste, 123",
  };

  const validCustomer = {
    name: "João da Silva",
    email: "joao@example.com",
    phone: "11988888888",
    isActive: true,
  };

  const validService = {
    name: "Corte de Cabelo",
    description: "Corte masculino",
    price: 50.0,
    durationMinutes: 30,
    isActive: true,
  };

  const validBooking = {
    status: BookingStatus.PENDING,
    requestedStart: new Date(Date.now() + 60 * 60 * 1000),
    requestedEnd: new Date(Date.now() + 90 * 60 * 1000),
    notes: "Cliente preferencial",
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

  describe("Successful Creation", () => {
    test("should create booking with all fields", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
      };

      const createdBooking = await createBooking.execute(bookingData);

      expect(createdBooking).toBeDefined();
      expect(createdBooking.id).toBeDefined();
      expect(createdBooking.tenantId).toBe(tenantId);
      expect(createdBooking.customerId).toBe(customerId);
      expect(createdBooking.serviceId).toBe(serviceId);
      expect(createdBooking.status).toBe(BookingStatus.PENDING);
      expect(createdBooking.requestedStart).toEqual(
        validBooking.requestedStart
      );
      expect(createdBooking.requestedEnd).toEqual(validBooking.requestedEnd);
      expect(createdBooking.createdAt).toBeInstanceOf(Date);
      expect(createdBooking.updatedAt).toBeInstanceOf(Date);
    });

    test("should create booking without customer", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        serviceId,
      };

      const createdBooking = await createBooking.execute(bookingData);

      expect(createdBooking).toBeDefined();
      expect(createdBooking.customerId).toBeUndefined();
    });

    test("should create booking without service", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
      };

      const createdBooking = await createBooking.execute(bookingData);

      expect(createdBooking).toBeDefined();
      expect(createdBooking.serviceId).toBeUndefined();
    });

    test("should create booking with different statuses", async () => {
      const pending = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.PENDING,
        requestedStart: new Date(Date.now() + 2 * 60 * 60 * 1000),
        requestedEnd: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      });

      const confirmed = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date(Date.now() + 3 * 60 * 60 * 1000),
        requestedEnd: new Date(Date.now() + 3.5 * 60 * 60 * 1000),
      });

      expect(pending.status).toBe(BookingStatus.PENDING);
      expect(confirmed.status).toBe(BookingStatus.CONFIRMED);
    });

    test("should create booking without notes", async () => {
      const bookingData = {
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date(Date.now() + 4 * 60 * 60 * 1000),
        requestedEnd: new Date(Date.now() + 4.5 * 60 * 60 * 1000),
      };

      const createdBooking = await createBooking.execute(bookingData);

      expect(createdBooking).toBeDefined();
      expect(createdBooking.notes).toBeUndefined();
    });

    test("should persist booking in repository", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
      };

      const createdBooking = await createBooking.execute(bookingData);
      const foundBooking = await bookingRepository.findById(createdBooking.id!);

      expect(foundBooking).toBeDefined();
      expect(foundBooking?.id).toBe(createdBooking.id);
    });
  });

  describe("Tenant Validation", () => {
    test("should throw error if tenant does not exist", async () => {
      const bookingData = {
        ...validBooking,
        tenantId: "invalid-tenant",
        customerId,
        serviceId,
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Tenant não encontrado"
      );
    });
  });

  describe("Customer Validation", () => {
    test("should throw error if customer does not exist", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId: "invalid-customer",
        serviceId,
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Cliente não encontrado"
      );
    });

    test("should throw error if customer does not belong to tenant", async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: "outro@example.com",
        slug: "outro",
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2.id!,
        email: "outro@example.com",
        phone: "11977777777",
      });

      const bookingData = {
        ...validBooking,
        tenantId,
        customerId: customer2.id!,
        serviceId,
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Cliente não pertence a este tenant"
      );
    });
  });

  describe("Service Validation", () => {
    test("should throw error if service does not exist", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        serviceId: "invalid-service",
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Serviço não encontrado"
      );
    });

    test("should throw error if service does not belong to tenant", async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: "outro@example.com",
        slug: "outro",
      });

      const service2 = await createService.execute({
        ...validService,
        tenantId: tenant2.id!,
        name: "Outro Serviço",
      });

      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        serviceId: service2.id!,
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Serviço não pertence a este tenant"
      );
    });
  });

  describe("Time Conflict Validation", () => {
    test("should not allow overlapping bookings for same staff", async () => {
      const now = Date.now();
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 24 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25 * 60 * 60 * 1000),
      });

      await expect(() =>
        createBooking.execute({
          ...validBooking,
          tenantId,
          customerId,
          serviceId,
          staffUserId: "staff-123",
          requestedStart: new Date(now + 24.5 * 60 * 60 * 1000),
          requestedEnd: new Date(now + 25.5 * 60 * 60 * 1000),
        })
      ).rejects.toThrow("Já existe um agendamento neste horário");
    });

    test("should allow overlapping bookings for different staff", async () => {
      const now = Date.now();
      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 24 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25 * 60 * 60 * 1000),
      });

      const booking2 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-456",
        requestedStart: new Date(now + 24.5 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25.5 * 60 * 60 * 1000),
      });

      expect(booking1).toBeDefined();
      expect(booking2).toBeDefined();
    });

    test("should allow consecutive time slots", async () => {
      const now = Date.now();
      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 24 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25 * 60 * 60 * 1000),
      });

      const booking2 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 25 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 26 * 60 * 60 * 1000),
      });

      expect(booking1).toBeDefined();
      expect(booking2).toBeDefined();
    });

    test("should allow overlapping with cancelled bookings", async () => {
      const now = Date.now();
      await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        status: BookingStatus.CANCELLED,
        requestedStart: new Date(now + 24 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25 * 60 * 60 * 1000),
      });

      const booking = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 24.5 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25.5 * 60 * 60 * 1000),
      });

      expect(booking).toBeDefined();
    });
  });

  describe("Entity Validation Errors", () => {
    test("should throw error when end time is before start time", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date("2025-10-06T11:00:00"),
        requestedEnd: new Date("2025-10-06T10:00:00"),
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Data de término deve ser posterior à data de início"
      );
    });

    test("should throw error when start equals end time", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        requestedStart: new Date("2025-10-06T10:00:00"),
        requestedEnd: new Date("2025-10-06T10:00:00"),
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Data de término deve ser posterior à data de início"
      );
    });

    test("should throw error for invalid rating", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        rating: 6,
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Avaliação deve estar entre 1 e 5"
      );
    });

    test("should throw error for notes longer than 1000 characters", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        notes: "a".repeat(1001),
      };

      await expect(() => createBooking.execute(bookingData)).rejects.toThrow(
        "Notas não podem ter mais de 1000 caracteres"
      );
    });
  });

  describe("Edge Cases", () => {
    test("should handle booking on different dates at same time", async () => {
      const now = Date.now();
      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 24 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 25 * 60 * 60 * 1000),
      });

      const booking2 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        serviceId,
        staffUserId: "staff-123",
        requestedStart: new Date(now + 48 * 60 * 60 * 1000),
        requestedEnd: new Date(now + 49 * 60 * 60 * 1000),
      });

      expect(booking1).toBeDefined();
      expect(booking2).toBeDefined();
    });

    test("should handle different tenants with same time", async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: "outro@example.com",
        slug: "outro",
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2.id!,
        email: "outro@example.com",
        phone: "11977777777",
      });

      const booking1 = await createBooking.execute({
        ...validBooking,
        tenantId,
        customerId,
        staffUserId: "staff-123",
      });

      const booking2 = await createBooking.execute({
        ...validBooking,
        tenantId: tenant2.id!,
        customerId: customer2.id!,
        staffUserId: "staff-123",
      });

      expect(booking1).toBeDefined();
      expect(booking2).toBeDefined();
    });

    test("should accept valid rating values", async () => {
      const now = Date.now();
      for (let rating = 1; rating <= 5; rating++) {
        const booking = await createBooking.execute({
          ...validBooking,
          tenantId,
          customerId,
          requestedStart: new Date(now + (24 + rating) * 60 * 60 * 1000),
          requestedEnd: new Date(now + (25 + rating) * 60 * 60 * 1000),
          rating,
        });

        expect(booking.rating).toBe(rating);
      }
    });

    test("should accept notes with exactly 1000 characters", async () => {
      const bookingData = {
        ...validBooking,
        tenantId,
        customerId,
        notes: "a".repeat(1000),
      };

      const createdBooking = await createBooking.execute(bookingData);

      expect(createdBooking).toBeDefined();
      expect(createdBooking.notes?.length).toBe(1000);
    });
  });
});
