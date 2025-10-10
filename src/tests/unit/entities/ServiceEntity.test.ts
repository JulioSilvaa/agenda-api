import { describe, expect, test } from 'vitest';
import { ServiceEntity } from '../../../core/entities/ServiceEntity';

describe('Unit test ServiceEntity', () => {
  const validServiceData = {
    id: '123',
    tenantId: 'tenant-123',
    name: 'Corte de Cabelo',
    description: 'Corte de cabelo masculino',
    price: 50.0,
    durationMinutes: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Entity Creation', () => {
    test('should create service with valid data', () => {
      const service = ServiceEntity.create(validServiceData);

      expect(service).toBeDefined();
      expect(service.name).toBe(validServiceData.name);
      expect(service.description).toBe(validServiceData.description);
      expect(service.price).toBe(50.0);
      expect(service.durationMinutes).toBe(30);
      expect(service.isActive).toBe(true);
    });

    test('should create service without description', () => {
      const service = ServiceEntity.create({
        ...validServiceData,
        description: undefined,
      });

      expect(service.description).toBeNull();
    });

    test('should create service with default isActive as true', () => {
      const service = ServiceEntity.create({
        ...validServiceData,
        isActive: undefined as any,
      });

      expect(service.isActive).toBe(true);
    });
  });

  describe('Name Validation', () => {
    test('should reject empty name', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          name: '',
        })
      ).toThrow('Nome é obrigatório');
    });

    test('should reject name with less than 3 characters', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          name: 'ab',
        })
      ).toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should reject name with more than 100 characters', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          name: 'a'.repeat(101),
        })
      ).toThrow('Nome não pode ter mais de 100 caracteres');
    });
  });

  describe('Price Validation', () => {
    test('should accept valid price', () => {
      const service = ServiceEntity.create({
        ...validServiceData,
        price: 100.5,
      });

      expect(service.price).toBe(100.5);
    });

    test('should reject zero price', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          price: 0,
        })
      ).toThrow('Preço deve ser maior que zero');
    });

    test('should reject negative price', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          price: -10,
        })
      ).toThrow('Preço não pode ser negativo');
    });
  });

  describe('Duration Validation', () => {
    test('should accept valid duration', () => {
      const service = ServiceEntity.create({
        ...validServiceData,
        durationMinutes: 60,
      });

      expect(service.durationMinutes).toBe(60);
    });

    test('should reject zero duration', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          durationMinutes: 0,
        })
      ).toThrow('Duração deve ser maior que zero');
    });

    test('should reject negative duration', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          durationMinutes: -10,
        })
      ).toThrow('Duração deve ser maior que zero');
    });

    test('should reject duration greater than 24 hours', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          durationMinutes: 1441,
        })
      ).toThrow('Duração não pode ser maior que 24 horas');
    });

    test('should accept exactly 24 hours', () => {
      const service = ServiceEntity.create({
        ...validServiceData,
        durationMinutes: 1440,
      });

      expect(service.durationMinutes).toBe(1440);
    });
  });

  describe('Description Validation', () => {
    test('should accept valid description', () => {
      const service = ServiceEntity.create(validServiceData);
      expect(service.description).toBe(validServiceData.description);
    });

    test('should accept null description', () => {
      const service = ServiceEntity.create({
        ...validServiceData,
        description: undefined,
      });

      expect(service.description).toBeNull();
    });

    test('should reject description with more than 500 characters', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          description: 'a'.repeat(501),
        })
      ).toThrow('Descrição não pode ter mais de 500 caracteres');
    });
  });

  describe('TenantId Validation', () => {
    test('should reject empty tenantId', () => {
      expect(() =>
        ServiceEntity.create({
          ...validServiceData,
          tenantId: '',
        })
      ).toThrow('TenantId é obrigatório');
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const service = ServiceEntity.create(validServiceData);

      expect(service.id).toBe(validServiceData.id);
      expect(service.tenantId).toBe(validServiceData.tenantId);
      expect(service.name).toBe(validServiceData.name);
      expect(service.description).toBe(validServiceData.description);
      expect(service.price).toBe(validServiceData.price);
      expect(service.durationMinutes).toBe(validServiceData.durationMinutes);
      expect(service.isActive).toBe(validServiceData.isActive);
    });
  });
});
