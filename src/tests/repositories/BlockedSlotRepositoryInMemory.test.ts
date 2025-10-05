import { describe, expect, test, beforeEach } from 'vitest';
import { BlockedSlotRepositoryInMemory } from '../../infra/repositories/repositoryInMemory/BlockedSlotRepositoryInMemory';
import { BlockedSlotEntity } from '../../core/entities/BlockedSlotEntity';

describe('Unit test BlockedSlotRepositoryInMemory', () => {
  let repository: BlockedSlotRepositoryInMemory;
  const tenantId = 'tenant-123';
  const tenantId2 = 'tenant-456';

  beforeEach(() => {
    repository = new BlockedSlotRepositoryInMemory();
  });

  const createValidSlot = (
    startTime: Date,
    endTime: Date,
    tenant: string = tenantId,
    staffId?: string
  ) => {
    return BlockedSlotEntity.create({
      id: crypto.randomUUID(),
      tenantId: tenant,
      staffUserId: staffId,
      startTime,
      endTime,
      reason: 'Test block',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('create method', () => {
    test('should create and return blocked slot', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );

      const createdSlot = await repository.create(slot);

      expect(createdSlot).toBeDefined();
      expect(createdSlot).toBe(slot);
    });

    test('should store blocked slot in memory', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );

      await repository.create(slot);

      const foundSlot = await repository.findById(slot.id!);
      expect(foundSlot).toBeDefined();
      expect(foundSlot?.id).toBe(slot.id);
    });

    test('should create multiple blocked slots', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00')
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByTenantId(tenantId);
      expect(slots.length).toBe(2);
    });
  });

  describe('delete method', () => {
    test('should delete blocked slot', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );

      await repository.create(slot);
      await repository.delete(slot.id!);

      const foundSlot = await repository.findById(slot.id!);
      expect(foundSlot).toBeNull();
    });

    test('should not affect other slots when deleting', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00')
      );

      await repository.create(slot1);
      await repository.create(slot2);
      await repository.delete(slot1.id!);

      const foundSlot1 = await repository.findById(slot1.id!);
      const foundSlot2 = await repository.findById(slot2.id!);

      expect(foundSlot1).toBeNull();
      expect(foundSlot2).toBeDefined();
    });

    test('should handle deletion of non-existent slot', async () => {
      await repository.delete('non-existent-id');

      const slots = await repository.findByTenantId(tenantId);
      expect(slots.length).toBe(0);
    });
  });

  describe('findById method', () => {
    test('should find blocked slot by id', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );

      await repository.create(slot);

      const foundSlot = await repository.findById(slot.id!);
      expect(foundSlot).toBeDefined();
      expect(foundSlot?.id).toBe(slot.id);
    });

    test('should return null when not found', async () => {
      const foundSlot = await repository.findById('non-existent-id');
      expect(foundSlot).toBeNull();
    });
  });

  describe('findByTenantId method', () => {
    test('should find all blocked slots by tenantId', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00')
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByTenantId(tenantId);
      expect(slots.length).toBe(2);
    });

    test('should return empty array when no slots found', async () => {
      const slots = await repository.findByTenantId('non-existent-tenant');
      expect(slots).toEqual([]);
    });

    test('should return only slots from specified tenant', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00'),
        tenantId2
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByTenantId(tenantId);
      expect(slots.length).toBe(1);
      expect(slots[0].tenantId).toBe(tenantId);
    });
  });

  describe('findByStaffUserId method', () => {
    test('should find blocked slots by staff user id', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId,
        'staff-1'
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00'),
        tenantId,
        'staff-1'
      );
      const slot3 = createValidSlot(
        new Date('2025-10-12T09:00:00'),
        new Date('2025-10-12T10:00:00'),
        tenantId,
        'staff-2'
      );

      await repository.create(slot1);
      await repository.create(slot2);
      await repository.create(slot3);

      const slots = await repository.findByStaffUserId('staff-1', tenantId);
      expect(slots.length).toBe(2);
      expect(slots.every(s => s.staffUserId === 'staff-1')).toBe(true);
    });

    test('should return empty array when staff has no blocks', async () => {
      const slots = await repository.findByStaffUserId('staff-99', tenantId);
      expect(slots).toEqual([]);
    });

    test('should filter by tenant when searching by staff', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId,
        'staff-1'
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00'),
        tenantId2,
        'staff-1'
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByStaffUserId('staff-1', tenantId);
      expect(slots.length).toBe(1);
      expect(slots[0].tenantId).toBe(tenantId);
    });
  });

  describe('findByTimeRange method', () => {
    test('should find blocks that overlap with time range', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T11:00:00')
      );

      await repository.create(slot);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T10:00:00'),
        new Date('2025-10-10T12:00:00')
      );

      expect(slots.length).toBe(1);
    });

    test('should not find non-overlapping blocks', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );

      await repository.create(slot);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T10:00:00'),
        new Date('2025-10-10T11:00:00')
      );

      expect(slots.length).toBe(0);
    });

    test('should find block when search range is completely inside', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T13:00:00')
      );

      await repository.create(slot);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T10:00:00'),
        new Date('2025-10-10T11:00:00')
      );

      expect(slots.length).toBe(1);
    });

    test('should find block when search range completely outside', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T10:00:00'),
        new Date('2025-10-10T11:00:00')
      );

      await repository.create(slot);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T12:00:00')
      );

      expect(slots.length).toBe(1);
    });

    test('should filter by tenant in time range search', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId
      );
      const slot2 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId2
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );

      expect(slots.length).toBe(1);
      expect(slots[0].tenantId).toBe(tenantId);
    });

    test('should filter by staff when provided', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId,
        'staff-1'
      );
      const slot2 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId,
        'staff-2'
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        'staff-1'
      );

      expect(slots.length).toBe(1);
      expect(slots[0].staffUserId).toBe('staff-1');
    });

    test('should include general blocks (null staffUserId) when searching with staffUserId', async () => {
      const generalBlock = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId,
        undefined
      );
      const staffBlock = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        tenantId,
        'staff-1'
      );

      await repository.create(generalBlock);
      await repository.create(staffBlock);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00'),
        'staff-1'
      );

      expect(slots.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    test('should preserve order of creation', async () => {
      const slot1 = createValidSlot(
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );
      const slot2 = createValidSlot(
        new Date('2025-10-11T09:00:00'),
        new Date('2025-10-11T10:00:00')
      );

      await repository.create(slot1);
      await repository.create(slot2);

      const slots = await repository.findByTenantId(tenantId);
      expect(slots[0].id).toBe(slot1.id);
      expect(slots[1].id).toBe(slot2.id);
    });

    test('should handle multi-day blocks', async () => {
      const slot = createValidSlot(
        new Date('2025-10-10T00:00:00'),
        new Date('2025-10-15T23:59:59')
      );

      await repository.create(slot);

      const slots = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-12T00:00:00'),
        new Date('2025-10-12T23:59:59')
      );

      expect(slots.length).toBe(1);
    });

    test('should not throw error when searching in empty repository', async () => {
      const slots = await repository.findByTenantId(tenantId);
      expect(slots).toEqual([]);

      const slotsByStaff = await repository.findByStaffUserId('staff-1', tenantId);
      expect(slotsByStaff).toEqual([]);

      const slotsByRange = await repository.findByTimeRange(
        tenantId,
        new Date('2025-10-10T09:00:00'),
        new Date('2025-10-10T10:00:00')
      );
      expect(slotsByRange).toEqual([]);
    });
  });
});
