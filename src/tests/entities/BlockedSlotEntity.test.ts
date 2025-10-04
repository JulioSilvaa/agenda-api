import { describe, expect, test } from 'vitest';
import { BlockedSlotEntity } from '../../core/entities/BlockedSlotEntity';

describe('Unit test BlockedSlotEntity', () => {
  const now = new Date();
  const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const futureEnd = new Date(futureStart.getTime() + 60 * 60 * 1000);

  const validBlockedSlotData = {
    id: '123',
    tenantId: 'tenant-123',
    staffUserId: 'staff-123',
    startTime: futureStart,
    endTime: futureEnd,
    reason: 'Reunião interna',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Entity Creation', () => {
    test('should create blocked slot with valid data', () => {
      const blockedSlot = BlockedSlotEntity.create(validBlockedSlotData);

      expect(blockedSlot).toBeDefined();
      expect(blockedSlot.tenantId).toBe(validBlockedSlotData.tenantId);
      expect(blockedSlot.staffUserId).toBe(validBlockedSlotData.staffUserId);
      expect(blockedSlot.reason).toBe(validBlockedSlotData.reason);
    });

    test('should create blocked slot without optional fields', () => {
      const blockedSlot = BlockedSlotEntity.create({
        ...validBlockedSlotData,
        staffUserId: undefined,
        reason: undefined,
      });

      expect(blockedSlot.staffUserId).toBeNull();
      expect(blockedSlot.reason).toBeNull();
    });
  });

  describe('Time Range Validation', () => {
    test('should accept valid time range', () => {
      const blockedSlot = BlockedSlotEntity.create(validBlockedSlotData);
      expect(blockedSlot).toBeDefined();
    });

    test('should reject endTime before startTime', () => {
      expect(() =>
        BlockedSlotEntity.create({
          ...validBlockedSlotData,
          startTime: futureEnd,
          endTime: futureStart,
        })
      ).toThrow('Horário de término deve ser posterior ao horário de início');
    });

    test('should reject endTime equal to startTime', () => {
      expect(() =>
        BlockedSlotEntity.create({
          ...validBlockedSlotData,
          startTime: futureStart,
          endTime: futureStart,
        })
      ).toThrow('Horário de término deve ser posterior ao horário de início');
    });

    test('should accept time range with 1 minute difference', () => {
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 1000);

      const blockedSlot = BlockedSlotEntity.create({
        ...validBlockedSlotData,
        startTime: start,
        endTime: end,
      });

      expect(blockedSlot).toBeDefined();
    });
  });

  describe('Reason Validation', () => {
    test('should accept valid reason', () => {
      const blockedSlot = BlockedSlotEntity.create(validBlockedSlotData);
      expect(blockedSlot.reason).toBe(validBlockedSlotData.reason);
    });

    test('should accept null reason', () => {
      const blockedSlot = BlockedSlotEntity.create({
        ...validBlockedSlotData,
        reason: undefined,
      });

      expect(blockedSlot.reason).toBeNull();
    });

    test('should reject reason with more than 500 characters', () => {
      expect(() =>
        BlockedSlotEntity.create({
          ...validBlockedSlotData,
          reason: 'a'.repeat(501),
        })
      ).toThrow('Motivo não pode ter mais de 500 caracteres');
    });

    test('should accept reason with exactly 500 characters', () => {
      const blockedSlot = BlockedSlotEntity.create({
        ...validBlockedSlotData,
        reason: 'a'.repeat(500),
      });

      expect(blockedSlot.reason).toHaveLength(500);
    });
  });

  describe('TenantId Validation', () => {
    test('should reject empty tenantId', () => {
      expect(() =>
        BlockedSlotEntity.create({
          ...validBlockedSlotData,
          tenantId: '',
        })
      ).toThrow('TenantId é obrigatório');
    });

    test('should reject tenantId with only spaces', () => {
      expect(() =>
        BlockedSlotEntity.create({
          ...validBlockedSlotData,
          tenantId: '   ',
        })
      ).toThrow('TenantId é obrigatório');
    });
  });

  describe('Date Validation', () => {
    test('should accept valid dates', () => {
      const blockedSlot = BlockedSlotEntity.create(validBlockedSlotData);
      expect(blockedSlot.createdAt).toBeDefined();
      expect(blockedSlot.updatedAt).toBeDefined();
    });

    test('should reject updatedAt before createdAt', () => {
      const createdAt = new Date();
      const updatedAt = new Date(createdAt.getTime() - 1000);

      expect(() =>
        BlockedSlotEntity.create({
          ...validBlockedSlotData,
          createdAt,
          updatedAt,
        })
      ).toThrow('Data de atualização não pode ser anterior à data de criação');
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const blockedSlot = BlockedSlotEntity.create(validBlockedSlotData);

      expect(blockedSlot.id).toBe(validBlockedSlotData.id);
      expect(blockedSlot.tenantId).toBe(validBlockedSlotData.tenantId);
      expect(blockedSlot.staffUserId).toBe(validBlockedSlotData.staffUserId);
      expect(blockedSlot.startTime).toBe(validBlockedSlotData.startTime);
      expect(blockedSlot.endTime).toBe(validBlockedSlotData.endTime);
      expect(blockedSlot.reason).toBe(validBlockedSlotData.reason);
    });

    test('should return null for optional fields when not provided', () => {
      const blockedSlot = BlockedSlotEntity.create({
        ...validBlockedSlotData,
        staffUserId: undefined,
        reason: undefined,
      });

      expect(blockedSlot.staffUserId).toBeNull();
      expect(blockedSlot.reason).toBeNull();
    });
  });
});
