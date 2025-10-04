import { describe, expect, test } from 'vitest';
import { AvailabilityEntity } from '../../core/entities/AvailabilityEntity';

describe('Unit test AvailabilityEntity', () => {
  const validAvailabilityData = {
    id: '123',
    tenantId: 'tenant-123',
    weekday: 1,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Entity Creation', () => {
    test('should create availability with valid data', () => {
      const availability = AvailabilityEntity.create(validAvailabilityData);

      expect(availability).toBeDefined();
      expect(availability.weekday).toBe(1);
      expect(availability.startTime).toBe('09:00');
      expect(availability.endTime).toBe('18:00');
      expect(availability.isActive).toBe(true);
    });

    test('should create availability with default isActive as true', () => {
      const availability = AvailabilityEntity.create({
        ...validAvailabilityData,
        isActive: undefined as any,
      });

      expect(availability.isActive).toBe(true);
    });
  });

  describe('Weekday Validation', () => {
    test('should accept Sunday (0)', () => {
      const availability = AvailabilityEntity.create({
        ...validAvailabilityData,
        weekday: 0,
      });

      expect(availability.weekday).toBe(0);
    });

    test('should accept Saturday (6)', () => {
      const availability = AvailabilityEntity.create({
        ...validAvailabilityData,
        weekday: 6,
      });

      expect(availability.weekday).toBe(6);
    });

    test('should reject negative weekday', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          weekday: -1,
        })
      ).toThrow('Dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)');
    });

    test('should reject weekday greater than 6', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          weekday: 7,
        })
      ).toThrow('Dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)');
    });
  });

  describe('Time Format Validation', () => {
    test('should accept valid time format', () => {
      const availability = AvailabilityEntity.create(validAvailabilityData);
      expect(availability.startTime).toBe('09:00');
      expect(availability.endTime).toBe('18:00');
    });

    test('should accept midnight time', () => {
      const availability = AvailabilityEntity.create({
        ...validAvailabilityData,
        startTime: '00:00',
        endTime: '23:59',
      });

      expect(availability.startTime).toBe('00:00');
    });

    test('should reject invalid startTime format', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          startTime: '9:00',
        })
      ).toThrow('Horário de início inválido. Use formato HH:MM');
    });

    test('should reject invalid endTime format', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          endTime: '18:0',
        })
      ).toThrow('Horário de término inválido. Use formato HH:MM');
    });

    test('should reject startTime with invalid hour', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          startTime: '24:00',
        })
      ).toThrow('Horário de início inválido');
    });

    test('should reject endTime with invalid minute', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          endTime: '18:60',
        })
      ).toThrow('Horário de término inválido');
    });
  });

  describe('Time Range Validation', () => {
    test('should accept valid time range', () => {
      const availability = AvailabilityEntity.create({
        ...validAvailabilityData,
        startTime: '08:00',
        endTime: '17:00',
      });

      expect(availability).toBeDefined();
    });

    test('should reject endTime equal to startTime', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          startTime: '09:00',
          endTime: '09:00',
        })
      ).toThrow('Horário de término deve ser maior que horário de início');
    });

    test('should reject endTime before startTime', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          startTime: '18:00',
          endTime: '09:00',
        })
      ).toThrow('Horário de término deve ser maior que horário de início');
    });

    test('should accept time range with 1 minute difference', () => {
      const availability = AvailabilityEntity.create({
        ...validAvailabilityData,
        startTime: '09:00',
        endTime: '09:01',
      });

      expect(availability).toBeDefined();
    });
  });

  describe('TenantId Validation', () => {
    test('should reject empty tenantId', () => {
      expect(() =>
        AvailabilityEntity.create({
          ...validAvailabilityData,
          tenantId: '',
        })
      ).toThrow('TenantId é obrigatório');
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const availability = AvailabilityEntity.create(validAvailabilityData);

      expect(availability.id).toBe(validAvailabilityData.id);
      expect(availability.tenantId).toBe(validAvailabilityData.tenantId);
      expect(availability.weekday).toBe(validAvailabilityData.weekday);
      expect(availability.startTime).toBe(validAvailabilityData.startTime);
      expect(availability.endTime).toBe(validAvailabilityData.endTime);
      expect(availability.isActive).toBe(validAvailabilityData.isActive);
    });
  });
});
