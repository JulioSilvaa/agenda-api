import { describe, expect, test, beforeEach } from 'vitest';
import { BlockedSlotRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/BlockedSlotRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateBlockedSlot } from '../../../core/useCases/blockedSlot/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';

describe('Unit test CreateBlockedSlot UseCase', () => {
  let blockedSlotRepository: BlockedSlotRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createBlockedSlot: CreateBlockedSlot;
  let createTenant: CreateTenant;
  let tenantId: string;

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
    createBlockedSlot = new CreateBlockedSlot(blockedSlotRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Creation', () => {
    test('should create blocked slot with all fields', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Reunião de equipe',
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);

      expect(createdSlot).toBeDefined();
      expect(createdSlot.id).toBeDefined();
      expect(createdSlot.tenantId).toBe(tenantId);
      expect(createdSlot.staffUserId).toBe('staff-123');
      expect(createdSlot.startTime).toEqual(blockedSlotData.startTime);
      expect(createdSlot.endTime).toEqual(blockedSlotData.endTime);
      expect(createdSlot.reason).toBe('Reunião de equipe');
      expect(createdSlot.createdAt).toBeInstanceOf(Date);
      expect(createdSlot.updatedAt).toBeInstanceOf(Date);
    });

    test('should create blocked slot without staff (blocks all)', async () => {
      const blockedSlotData = {
        tenantId,
        startTime: new Date('2025-11-15T00:00:00'),
        endTime: new Date('2025-11-15T23:59:59'),
        reason: 'Feriado',
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);

      expect(createdSlot).toBeDefined();
      expect(createdSlot.staffUserId).toBeNull();
      expect(createdSlot.reason).toBe('Feriado');
    });

    test('should create blocked slot without reason', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T12:00:00'),
        endTime: new Date('2025-10-10T13:00:00'),
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);

      expect(createdSlot).toBeDefined();
      expect(createdSlot.reason).toBeNull();
    });

    test('should create multiple non-overlapping blocks', async () => {
      const slot1 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Bloco 1',
      });

      const slot2 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T11:00:00'),
        reason: 'Bloco 2',
      });

      expect(slot1).toBeDefined();
      expect(slot2).toBeDefined();
      expect(slot1.id).not.toBe(slot2.id);
    });

    test('should create blocks for different staff in same time', async () => {
      const slot1 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-1',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Staff 1 ocupado',
      });

      const slot2 = await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-2',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Staff 2 ocupado',
      });

      expect(slot1).toBeDefined();
      expect(slot2).toBeDefined();
      expect(slot1.staffUserId).not.toBe(slot2.staffUserId);
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error if tenant does not exist', async () => {
      const blockedSlotData = {
        tenantId: 'invalid-tenant',
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      };

      await expect(() => createBlockedSlot.execute(blockedSlotData)).rejects.toThrow(
        'Tenant não encontrado'
      );
    });
  });

  describe('Conflict Validation', () => {
    test('should throw error for exact same time range and staff', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Primeiro bloqueio',
      };

      await createBlockedSlot.execute(blockedSlotData);

      await expect(() => createBlockedSlot.execute(blockedSlotData)).rejects.toThrow(
        'Já existe um bloqueio neste período'
      );
    });

    test('should throw error for overlapping time (start inside)', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T11:00:00'),
      });

      await expect(() =>
        createBlockedSlot.execute({
          tenantId,
          staffUserId: 'staff-123',
          startTime: new Date('2025-10-10T10:00:00'),
          endTime: new Date('2025-10-10T12:00:00'),
        })
      ).rejects.toThrow('Já existe um bloqueio neste período');
    });

    test('should throw error for overlapping time (end inside)', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T12:00:00'),
      });

      await expect(() =>
        createBlockedSlot.execute({
          tenantId,
          staffUserId: 'staff-123',
          startTime: new Date('2025-10-10T09:00:00'),
          endTime: new Date('2025-10-10T11:00:00'),
        })
      ).rejects.toThrow('Já existe um bloqueio neste período');
    });

    test('should throw error for overlapping time (completely inside)', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T13:00:00'),
      });

      await expect(() =>
        createBlockedSlot.execute({
          tenantId,
          staffUserId: 'staff-123',
          startTime: new Date('2025-10-10T10:00:00'),
          endTime: new Date('2025-10-10T11:00:00'),
        })
      ).rejects.toThrow('Já existe um bloqueio neste período');
    });

    test('should throw error for overlapping time (completely outside)', async () => {
      await createBlockedSlot.execute({
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T11:00:00'),
      });

      await expect(() =>
        createBlockedSlot.execute({
          tenantId,
          staffUserId: 'staff-123',
          startTime: new Date('2025-10-10T09:00:00'),
          endTime: new Date('2025-10-10T13:00:00'),
        })
      ).rejects.toThrow('Já existe um bloqueio neste período');
    });
  });

  describe('Entity Validation Errors', () => {
    test('should throw error for invalid tenant id', async () => {
      const blockedSlotData = {
        tenantId: '',
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
      };

      await expect(() => createBlockedSlot.execute(blockedSlotData)).rejects.toThrow();
    });

    test('should throw error when end time before start time', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T10:00:00'),
        endTime: new Date('2025-10-10T09:00:00'),
      };

      await expect(() => createBlockedSlot.execute(blockedSlotData)).rejects.toThrow(
        'Horário de término deve ser posterior ao horário de início'
      );
    });

    test('should throw error when end time equals start time', async () => {
      const time = new Date('2025-10-10T10:00:00');
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: time,
        endTime: time,
      };

      await expect(() => createBlockedSlot.execute(blockedSlotData)).rejects.toThrow(
        'Horário de término deve ser posterior ao horário de início'
      );
    });

    test('should throw error for reason longer than 500 characters', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'a'.repeat(501),
      };

      await expect(() => createBlockedSlot.execute(blockedSlotData)).rejects.toThrow(
        'Motivo não pode ter mais de 500 caracteres'
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle reason with exactly 500 characters', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'a'.repeat(500),
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);

      expect(createdSlot).toBeDefined();
      expect(createdSlot.reason?.length).toBe(500);
    });

    test('should handle multi-day block', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T00:00:00'),
        endTime: new Date('2025-10-15T23:59:59'),
        reason: 'Férias',
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);

      expect(createdSlot).toBeDefined();
      expect(createdSlot.reason).toBe('Férias');
    });

    test('should handle very short block (1 minute)', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T09:01:00'),
        reason: 'Pausa rápida',
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);

      expect(createdSlot).toBeDefined();
    });

    test('should persist blocked slot in repository', async () => {
      const blockedSlotData = {
        tenantId,
        staffUserId: 'staff-123',
        startTime: new Date('2025-10-10T09:00:00'),
        endTime: new Date('2025-10-10T10:00:00'),
        reason: 'Teste',
      };

      const createdSlot = await createBlockedSlot.execute(blockedSlotData);
      const foundSlot = await blockedSlotRepository.findById(createdSlot.id!);

      expect(foundSlot).toBeDefined();
      expect(foundSlot?.id).toBe(createdSlot.id);
    });
  });
});
