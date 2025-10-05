import { describe, expect, test, beforeEach } from 'vitest';
import { BookingRepositoryInMemory } from '../../infra/repositories/repositoryInMemory/BookingRepositoryInMemory';
import { BookingEntity } from '../../core/entities/BookingEntity';
import { BookingStatus } from '../../core/interfaces/Booking';

describe('Unit test BookingRepositoryInMemory', () => {
  let repository: BookingRepositoryInMemory;
  const tenantId = 'tenant-123';
  const tenant2Id = 'tenant-456';
  const customerId = 'customer-123';
  const serviceId = 'service-123';

  beforeEach(() => {
    repository = new BookingRepositoryInMemory();
  });

  describe('Create', () => {
    test('should create booking successfully', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(booking);

      expect(created).toBeDefined();
      expect(created.id).toBe(booking.id);
      expect(created.status).toBe(BookingStatus.PENDING);
    });

    test('should create multiple bookings', async () => {
      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const found1 = await repository.findById(booking1.id!);
      const found2 = await repository.findById(booking2.id!);

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });
  });

  describe('Update', () => {
    test('should update booking successfully', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);

      const updated = BookingEntity.create({
        ...booking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await repository.update(updated);

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    test('should throw error when updating non-existent booking', async () => {
      const booking = BookingEntity.create({
        id: 'non-existent',
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(() => repository.update(booking)).rejects.toThrow(
        'Agendamento não encontrado'
      );
    });
  });

  describe('Delete', () => {
    test('should delete booking successfully', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);
      await repository.delete(booking.id!);

      const found = await repository.findById(booking.id!);
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent booking', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });
  });

  describe('FindById', () => {
    test('should find booking by id', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);
      const found = await repository.findById(booking.id!);

      expect(found).toBeDefined();
      expect(found?.id).toBe(booking.id);
    });

    test('should return null when booking not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('FindByTenantId', () => {
    test('should find all bookings for a tenant', async () => {
      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const bookings = await repository.findByTenantId(tenantId);

      expect(bookings).toHaveLength(2);
      expect(bookings[0].tenantId).toBe(tenantId);
      expect(bookings[1].tenantId).toBe(tenantId);
    });

    test('should return empty array when tenant has no bookings', async () => {
      const bookings = await repository.findByTenantId('empty-tenant');
      expect(bookings).toHaveLength(0);
      expect(Array.isArray(bookings)).toBe(true);
    });

    test('should isolate bookings by tenant', async () => {
      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const tenant1Bookings = await repository.findByTenantId(tenantId);
      const tenant2Bookings = await repository.findByTenantId(tenant2Id);

      expect(tenant1Bookings).toHaveLength(1);
      expect(tenant2Bookings).toHaveLength(1);
    });
  });

  describe('FindByCustomerId', () => {
    test('should find bookings by customer', async () => {
      const customer2Id = 'customer-456';

      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId: customer2Id,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const customerBookings = await repository.findByCustomerId(customerId, tenantId);

      expect(customerBookings).toHaveLength(1);
      expect(customerBookings[0].customerId).toBe(customerId);
    });

    test('should return empty array when customer has no bookings', async () => {
      const bookings = await repository.findByCustomerId('non-existent', tenantId);
      expect(bookings).toHaveLength(0);
    });
  });

  describe('FindByServiceId', () => {
    test('should find bookings by service', async () => {
      const service2Id = 'service-456';

      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId: service2Id,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const serviceBookings = await repository.findByServiceId(serviceId, tenantId);

      expect(serviceBookings).toHaveLength(1);
      expect(serviceBookings[0].serviceId).toBe(serviceId);
    });
  });

  describe('FindByStaffUserId', () => {
    test('should find bookings by staff user', async () => {
      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-456',
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const staffBookings = await repository.findByStaffUserId('staff-123', tenantId);

      expect(staffBookings).toHaveLength(1);
      expect(staffBookings[0].staffUserId).toBe('staff-123');
    });
  });

  describe('FindByStatus', () => {
    test('should find bookings by status', async () => {
      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);

      const pendingBookings = await repository.findByStatus(BookingStatus.PENDING, tenantId);

      expect(pendingBookings).toHaveLength(1);
      expect(pendingBookings[0].status).toBe(BookingStatus.PENDING);
    });
  });

  describe('FindConflictingBookings', () => {
    test('should find overlapping bookings', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T12:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);

      const conflicts = await repository.findConflictingBookings(
        tenantId,
        new Date('2025-10-06T11:00:00'),
        new Date('2025-10-06T13:00:00'),
        'staff-123'
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe(booking.id);
    });

    test('should not find conflicts on different staff', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T12:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);

      const conflicts = await repository.findConflictingBookings(
        tenantId,
        new Date('2025-10-06T11:00:00'),
        new Date('2025-10-06T13:00:00'),
        'staff-456'
      );

      expect(conflicts).toHaveLength(0);
    });

    test('should ignore cancelled bookings in conflict check', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.CANCELLED,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T12:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);

      const conflicts = await repository.findConflictingBookings(
        tenantId,
        new Date('2025-10-06T11:00:00'),
        new Date('2025-10-06T13:00:00'),
        'staff-123'
      );

      expect(conflicts).toHaveLength(0);
    });

    test('should not find conflicts for consecutive time slots', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        staffUserId: 'staff-123',
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T12:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking);

      const conflicts = await repository.findConflictingBookings(
        tenantId,
        new Date('2025-10-06T12:00:00'),
        new Date('2025-10-06T14:00:00'),
        'staff-123'
      );

      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle bookings with optional fields', async () => {
      const booking = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(booking);
      const found = await repository.findById(created.id!);

      expect(found?.customerId).toBeUndefined();
      expect(found?.serviceId).toBeUndefined();
      expect(found?.staffUserId).toBeUndefined();
    });

    test('should maintain booking list after multiple operations', async () => {
      const booking1 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.PENDING,
        requestedStart: new Date('2025-10-06T10:00:00'),
        requestedEnd: new Date('2025-10-06T11:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const booking2 = BookingEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        customerId,
        serviceId,
        status: BookingStatus.CONFIRMED,
        requestedStart: new Date('2025-10-06T14:00:00'),
        requestedEnd: new Date('2025-10-06T15:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(booking1);
      await repository.create(booking2);
      await repository.delete(booking1.id!);

      const bookings = await repository.findByTenantId(tenantId);
      expect(bookings).toHaveLength(1);
      expect(bookings[0].id).toBe(booking2.id);
    });
  });
});
