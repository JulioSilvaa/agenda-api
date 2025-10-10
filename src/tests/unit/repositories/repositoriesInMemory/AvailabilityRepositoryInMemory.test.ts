import { describe, expect, test, beforeEach } from 'vitest';
import { AvailabilityRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/AvailabilityRepositoryInMemory';
import { AvailabilityEntity } from '../../../../core/entities/AvailabilityEntity';

describe('Unit test AvailabilityRepositoryInMemory', () => {
  let repository: AvailabilityRepositoryInMemory;
  const tenantId = 'tenant-123';
  const tenant2Id = 'tenant-456';

  beforeEach(() => {
    repository = new AvailabilityRepositoryInMemory();
  });

  describe('Create', () => {
    test('should create availability successfully', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(availability);

      expect(created).toBeDefined();
      expect(created.id).toBe(availability.id);
      expect(created.weekday).toBe(1);
    });

    test('should create multiple availabilities', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 2,
        startTime: '14:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);

      const found1 = await repository.findById(availability1.id!);
      const found2 = await repository.findById(availability2.id!);

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });
  });

  describe('Update', () => {
    test('should update availability successfully', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const updated = AvailabilityEntity.create({
        id: availability.id!,
        tenantId: availability.tenantId,
        weekday: availability.weekday,
        startTime: '10:00',
        endTime: availability.endTime,
        isActive: availability.isActive,
        createdAt: availability.createdAt,
        updatedAt: new Date(),
      });

      const result = await repository.update(updated);

      expect(result.startTime).toBe('10:00');
    });

    test('should throw error when updating non-existent availability', async () => {
      const availability = AvailabilityEntity.create({
        id: 'non-existent',
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(() => repository.update(availability)).rejects.toThrow(
        'Disponibilidade não encontrada'
      );
    });
  });

  describe('Delete', () => {
    test('should delete availability successfully', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);
      await repository.delete(availability.id!);

      const found = await repository.findById(availability.id!);
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent availability', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });

    test('should only delete specified availability', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 2,
        startTime: '14:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);

      await repository.delete(availability1.id!);

      const found1 = await repository.findById(availability1.id!);
      const found2 = await repository.findById(availability2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });
  });

  describe('FindById', () => {
    test('should find availability by id', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);
      const found = await repository.findById(availability.id!);

      expect(found).toBeDefined();
      expect(found?.id).toBe(availability.id);
      expect(found?.weekday).toBe(1);
    });

    test('should return null when availability not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('FindByTenantId', () => {
    test('should find all availabilities for a tenant', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 2,
        startTime: '14:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);

      const availabilities = await repository.findByTenantId(tenantId);

      expect(availabilities).toHaveLength(2);
      expect(availabilities[0].tenantId).toBe(tenantId);
      expect(availabilities[1].tenantId).toBe(tenantId);
    });

    test('should return empty array when tenant has no availabilities', async () => {
      const availabilities = await repository.findByTenantId('empty-tenant');
      expect(availabilities).toHaveLength(0);
      expect(Array.isArray(availabilities)).toBe(true);
    });

    test('should isolate availabilities by tenant', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);

      const tenant1Availabilities = await repository.findByTenantId(tenantId);
      const tenant2Availabilities = await repository.findByTenantId(tenant2Id);

      expect(tenant1Availabilities).toHaveLength(1);
      expect(tenant2Availabilities).toHaveLength(1);
    });
  });

  describe('FindByWeekday', () => {
    test('should find availabilities by weekday and tenant', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '14:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability3 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 2,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);
      await repository.create(availability3);

      const mondayAvailabilities = await repository.findByWeekday(1, tenantId);

      expect(mondayAvailabilities).toHaveLength(2);
      expect(mondayAvailabilities[0].weekday).toBe(1);
      expect(mondayAvailabilities[1].weekday).toBe(1);
    });

    test('should return empty array when no availabilities for weekday', async () => {
      const availabilities = await repository.findByWeekday(5, tenantId);
      expect(availabilities).toHaveLength(0);
    });

    test('should isolate weekday search by tenant', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);

      const tenant1Availabilities = await repository.findByWeekday(1, tenantId);
      const tenant2Availabilities = await repository.findByWeekday(1, tenant2Id);

      expect(tenant1Availabilities).toHaveLength(1);
      expect(tenant2Availabilities).toHaveLength(1);
      expect(tenant1Availabilities[0].id).toBe(availability1.id);
      expect(tenant2Availabilities[0].id).toBe(availability2.id);
    });
  });

  describe('FindConflictingSlots', () => {
    test('should find overlapping time slots', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const conflicts = await repository.findConflictingSlots(tenantId, 1, '10:00', '13:00');

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe(availability.id);
    });

    test('should not find conflicts on different weekdays', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const conflicts = await repository.findConflictingSlots(tenantId, 2, '10:00', '13:00');

      expect(conflicts).toHaveLength(0);
    });

    test('should not find conflicts for different tenants', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const conflicts = await repository.findConflictingSlots(tenant2Id, 1, '10:00', '13:00');

      expect(conflicts).toHaveLength(0);
    });

    test('should not find conflicts for consecutive time slots', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const conflicts = await repository.findConflictingSlots(tenantId, 1, '12:00', '15:00');

      expect(conflicts).toHaveLength(0);
    });

    test('should find conflicts when new slot is inside existing one', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const conflicts = await repository.findConflictingSlots(tenantId, 1, '12:00', '14:00');

      expect(conflicts).toHaveLength(1);
    });

    test('should find conflicts when new slot contains existing one', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '12:00',
        endTime: '14:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);

      const conflicts = await repository.findConflictingSlots(tenantId, 1, '09:00', '18:00');

      expect(conflicts).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle inactive availabilities', async () => {
      const availability = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability);
      const found = await repository.findById(availability.id!);

      expect(found?.isActive).toBe(false);
    });

    test('should maintain availability list after multiple operations', async () => {
      const availability1 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const availability2 = AvailabilityEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        weekday: 2,
        startTime: '14:00',
        endTime: '18:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(availability1);
      await repository.create(availability2);
      await repository.delete(availability1.id!);

      const availabilities = await repository.findByTenantId(tenantId);
      expect(availabilities).toHaveLength(1);
      expect(availabilities[0].id).toBe(availability2.id);
    });
  });
});
