import { describe, expect, test } from 'vitest';
import { CustomerEntity } from '../../core/entities/CustomerEntity';

describe('Unit test CustomerEntity', () => {
  const validCustomerData = {
    id: '123',
    tenantId: 'tenant-123',
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '11999999999',
    totalBookings: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Entity Creation', () => {
    test('should create customer with valid data', () => {
      const customer = CustomerEntity.create(validCustomerData);

      expect(customer).toBeDefined();
      expect(customer.name).toBe(validCustomerData.name);
      expect(customer.email).toBe(validCustomerData.email);
      expect(customer.phone).toBe(validCustomerData.phone);
      expect(customer.totalBookings).toBe(5);
    });

    test('should create customer without email', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        email: undefined,
      });

      expect(customer.email).toBeNull();
    });

    test('should create customer with default totalBookings as 0', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        totalBookings: undefined as any,
      });

      expect(customer.totalBookings).toBe(0);
    });
  });

  describe('Name Validation', () => {
    test('should reject empty name', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          name: '',
        })
      ).toThrow('Nome é obrigatório');
    });

    test('should reject name with less than 3 characters', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          name: 'ab',
        })
      ).toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should reject name with more than 100 characters', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          name: 'a'.repeat(101),
        })
      ).toThrow('Nome não pode ter mais de 100 caracteres');
    });
  });

  describe('Phone Validation', () => {
    test('should accept valid phone without formatting', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        phone: '11999999999',
      });

      expect(customer.phone).toBe('11999999999');
    });

    test('should accept phone with formatting', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        phone: '(11) 99999-9999',
      });

      expect(customer.phone).toBe('(11) 99999-9999');
    });

    test('should reject empty phone', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          phone: '',
        })
      ).toThrow('Telefone é obrigatório');
    });

    test('should reject phone with less than 8 digits', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          phone: '1234567',
        })
      ).toThrow('Telefone inválido');
    });

    test('should reject phone with more than 11 digits', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          phone: '119999999999',
        })
      ).toThrow('Telefone inválido');
    });
  });

  describe('Email Validation', () => {
    test('should accept valid email', () => {
      const customer = CustomerEntity.create(validCustomerData);
      expect(customer.email).toBe('maria@email.com');
    });

    test('should accept null email', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        email: undefined,
      });

      expect(customer.email).toBeNull();
    });

    test('should reject invalid email format', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          email: 'emailinvalido',
        })
      ).toThrow('Email inválido');
    });
  });

  describe('TotalBookings Validation', () => {
    test('should accept zero bookings', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        totalBookings: 0,
      });

      expect(customer.totalBookings).toBe(0);
    });

    test('should accept positive bookings', () => {
      const customer = CustomerEntity.create({
        ...validCustomerData,
        totalBookings: 100,
      });

      expect(customer.totalBookings).toBe(100);
    });

    test('should reject negative bookings', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          totalBookings: -1,
        })
      ).toThrow('Total de agendamentos não pode ser negativo');
    });
  });

  describe('TenantId Validation', () => {
    test('should reject empty tenantId', () => {
      expect(() =>
        CustomerEntity.create({
          ...validCustomerData,
          tenantId: '',
        })
      ).toThrow('TenantId é obrigatório');
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const customer = CustomerEntity.create(validCustomerData);

      expect(customer.id).toBe(validCustomerData.id);
      expect(customer.tenantId).toBe(validCustomerData.tenantId);
      expect(customer.name).toBe(validCustomerData.name);
      expect(customer.email).toBe(validCustomerData.email);
      expect(customer.phone).toBe(validCustomerData.phone);
      expect(customer.totalBookings).toBe(validCustomerData.totalBookings);
    });
  });
});
