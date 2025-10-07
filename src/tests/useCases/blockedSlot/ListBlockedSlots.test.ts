import { describe, expect, test, beforeEach } from 'vitest';
import { BlockedSlotRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/BlockedSlotRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateBlockedSlot } from '../../../core/useCases/blockedSlot/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
import { FindBlockedSlots } from '../../../core/useCases/blockedSlot/Find';
describe('Unit test ListBlockedSlots UseCase', () => {
  let blockedSlotRepository: BlockedSlotRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let listBlockedSlots: FindBlockedSlots;
  let createBlockedSlot: CreateBlockedSlot;
  let createTenant: CreateTenant;
  let tenantId: string;
  let tenant2Id: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    password: 'Senha#123',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  beforeEach(async () => {
    blockedSlotRepository = new BlockedSlotRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    listBlockedSlots = new FindBlockedSlots(blockedSlotRepository);
    createBlockedSlot = new CreateBlockedSlot(blockedSlotRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: 'salao2@example.com',
      slug: 'salao-2',
    });
    tenant2Id = tenant2.id!;
  });

  describe('List All by Tenant', () => {
    test('should list all blocks for a tenant', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-2',
        startTime: new Date('2025-10-11T09:00:00'),
        endTime: new Date('2025-10-11T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({ tenantId });

      expect(slots.length).toBe(2);
    });

    test('should return empty array when no blocks exist', async () => {
      const slots = await listBlockedSlots.execute({ tenantId });

      expect(slots).toEqual([]);
      expect(slots.length).toBe(0);
    });

    test('should only return blocks from specified tenant', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId: tenant2Id,
        staffUserId: 'staff-2',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({ tenantId });

      expect(slots.length).toBe(1);
      expect(slots[0].tenantId).toBe(tenantId);
    });
  });

  describe('List by Staff', () => {
    test('should list blocks for specific staff', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-11T09:00:00'),
        endTime: new Date('2025-10-11T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-2',
        startTime: new Date('2025-10-12T09:00:00'),
        endTime: new Date('2025-10-12T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        staffUserId: 'staff-1',
      });

      expect(slots.length).toBe(2);
      expect(slots.every(s => s.staffUserId === 'staff-1')).toBe(true);
    });

    test('should return empty array when staff has no blocks', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        staffUserId: 'staff-2',
      });

      expect(slots).toEqual([]);
    });
  });

  describe('List by Time Range', () => {
    test('should list blocks within time range', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-11T09:00:00'),
        endTime: new Date('2025-10-11T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-15T09:00:00'),
        endTime: new Date('2025-10-15T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        startTime: new Date('2025-10-10T00:00:00'),
        endTime: new Date('2025-10-12T23:59:59'),
      });

      expect(slots.length).toBe(2);
    });

    test('should find blocks that overlap with range', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T11:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T12:00:00'),
      });

      expect(slots.length).toBe(0);
    });

    test('should return empty for non-overlapping range', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        startTime: new Date('2025-10-11T09:00:00'),
        endTime: new Date('2025-10-11T10:00:00'),
      });

      expect(slots).toEqual([]);
    });

    test('should filter by staff and time range combined', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-2',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T00:00:00'),
        endTime: new Date('2025-10-10T23:59:59'),
      });

      expect(slots.length).toBe(1);
      expect(slots[0].staffUserId).toBe('staff-1');
    });
  });

  describe('List Blocks with null staffUserId', () => {
    test('should list general blocks (null staffUserId)', async () => {
      await createBlockedSlot.execute({
        tenantId,
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Feriado',
      });

      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-11T09:00:00'),
        endTime: new Date('2025-10-11T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({ tenantId });

      expect(slots.length).toBe(2);
      const generalBlock = slots.find(s => s.staffUserId === null);
      expect(generalBlock).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle many blocks efficiently', async () => {
      for (let i = 0; i < 20; i++) {
        await createBlockedSlot.execute({
          tenantId,
          staffUserId: 'staff-1',
          startTime: new Date(`2025-10-${10 + i}T09:00:00`),
          endTime: new Date(`2025-10-${10 + i}T10:00:00`),
        });
      }

      const slots = await listBlockedSlots.execute({ tenantId });

      expect(slots.length).toBe(20);
    });

    test('should preserve order of creation', async () => {
      const slot1 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slot2 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-11T09:00:00'),
        endTime: new Date('2025-10-11T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({ tenantId });

      expect(slots[0].id).toBe(slot1.id);
      expect(slots[1].id).toBe(slot2.id);
    });

    test('should list multi-day blocks', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T00:00:00'),
        endTime: new Date('2025-10-15T23:59:59'),
        reason: 'Férias',
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        startTime: new Date('2025-10-12T00:00:00'),
        endTime: new Date('2025-10-12T23:59:59'),
      });

      expect(slots.length).toBe(0);
    });

    test('should handle exact boundary matches', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slots = await listBlockedSlots.execute({
        tenantId,
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T11:00:00'),
      });

      expect(slots.length).toBe(0);
    });
  });
});
