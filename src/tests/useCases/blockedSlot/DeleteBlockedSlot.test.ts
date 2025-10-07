import { describe, expect, test, beforeEach } from 'vitest';
import { BlockedSlotRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/BlockedSlotRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { DeleteBlockedSlot } from '../../../core/useCases/blockedSlot/Delete';
import { CreateBlockedSlot } from '../../../core/useCases/blockedSlot/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';

describe('Unit test DeleteBlockedSlot UseCase', () => {
  let blockedSlotRepository: BlockedSlotRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let deleteBlockedSlot: DeleteBlockedSlot;
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
    deleteBlockedSlot = new DeleteBlockedSlot(blockedSlotRepository);
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

  describe('Successful Deletion', () => {
    test('should delete existing blocked slot', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Teste',
      });

      await deleteBlockedSlot.execute(createdSlot.id!, tenantId);

      const foundSlot = await blockedSlotRepository.findById(createdSlot.id!);
      expect(foundSlot).toBeNull();
    });

    test('should remove from repository', async () => {
      const slot1 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slot2 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T11:00:00'),
      });

      await deleteBlockedSlot.execute(slot1.id!, tenantId);

      const allSlots = await blockedSlotRepository.findByTenantId(tenantId);
      expect(allSlots.length).toBe(1);
      expect(allSlots[0].id).toBe(slot2.id);
    });

    test('should delete multiple blocks independently', async () => {
      const slot1 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slot2 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-2',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await deleteBlockedSlot.execute(slot1.id!, tenantId);

      const found1 = await blockedSlotRepository.findById(slot1.id!);
      const found2 = await blockedSlotRepository.findById(slot2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when blocked slot does not exist', async () => {
      await expect(() => deleteBlockedSlot.execute('non-existent-id', tenantId)).rejects.toThrow(
        'Bloqueio não encontrado'
      );
    });

    test('should throw error for empty id', async () => {
      await expect(() => deleteBlockedSlot.execute('', tenantId)).rejects.toThrow(
        'Bloqueio não encontrado'
      );
    });

    test('should throw error for null id', async () => {
      await expect(() => deleteBlockedSlot.execute(null as any, tenantId)).rejects.toThrow();
    });

    test('should throw error for undefined id', async () => {
      await expect(() => deleteBlockedSlot.execute(undefined as any, tenantId)).rejects.toThrow();
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to delete slot from different tenant', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await expect(() => deleteBlockedSlot.execute(createdSlot.id!, tenant2Id)).rejects.toThrow(
        'Bloqueio não pertence a este tenant'
      );
    });

    test('should throw error for invalid tenant id', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await expect(() =>
        deleteBlockedSlot.execute(createdSlot.id!, 'wrong-tenant')
      ).rejects.toThrow('Bloqueio não pertence a este tenant');
    });

    test('should throw error for empty tenant id', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await expect(() => deleteBlockedSlot.execute(createdSlot.id!, '')).rejects.toThrow(
        'Bloqueio não pertence a este tenant'
      );
    });
  });

  describe('Edge Cases', () => {
    test('should not affect other tenants blocks', async () => {
      const slot1 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      const slot2 = await createBlockedSlot.execute({
        tenantId: tenant2Id,
        staffUserId: 'staff-456',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await deleteBlockedSlot.execute(slot1.id!, tenantId);

      const found1 = await blockedSlotRepository.findById(slot1.id!);
      const found2 = await blockedSlotRepository.findById(slot2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });

    test('should handle deletion of already deleted slot', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      });

      await deleteBlockedSlot.execute(createdSlot.id!, tenantId);

      await expect(() => deleteBlockedSlot.execute(createdSlot.id!, tenantId)).rejects.toThrow(
        'Bloqueio não encontrado'
      );
    });

    test('should delete block with null staffUserId', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Bloqueio geral',
      });

      await deleteBlockedSlot.execute(createdSlot.id!, tenantId);

      const foundSlot = await blockedSlotRepository.findById(createdSlot.id!);
      expect(foundSlot).toBeNull();
    });

    test('should delete multi-day block', async () => {
      const createdSlot = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T00:00:00'),
        endTime: new Date('2025-10-15T23:59:59'),
        reason: 'Férias',
      });

      await deleteBlockedSlot.execute(createdSlot.id!, tenantId);

      const foundSlot = await blockedSlotRepository.findById(createdSlot.id!);
      expect(foundSlot).toBeNull();
    });
  });
});
