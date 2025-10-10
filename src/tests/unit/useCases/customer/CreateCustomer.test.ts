import { describe, expect, test, beforeEach } from 'vitest';
import { CustomerRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateCustomer } from '../../../../core/useCases/customer/Create';
import { CreateTenant } from '../../../../core/useCases/tenant/Create';

describe('Unit test CreateCustomer UseCase', () => {
  let customerRepository: CustomerRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createCustomer: CreateCustomer;
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

  const validCustomer = {
    name: 'João da Silva',
    email: 'joao@example.com',
    phone: '11988888888',
    isActive: true,
  };

  beforeEach(async () => {
    customerRepository = new CustomerRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createCustomer = new CreateCustomer(customerRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Creation', () => {
    test('should create customer with all fields', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.id).toBeDefined();
      expect(createdCustomer.tenantId).toBe(tenantId);
      expect(createdCustomer.name).toBe(validCustomer.name);
      expect(createdCustomer.email).toBe(validCustomer.email);
      expect(createdCustomer.phone).toBe(validCustomer.phone);
      expect(createdCustomer.isActive).toBe(true);
      expect(createdCustomer.createdAt).toBeInstanceOf(Date);
      expect(createdCustomer.updatedAt).toBeInstanceOf(Date);
    });

    test('should create inactive customer', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        isActive: false,
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.isActive).toBe(false);
    });

    test('should create multiple customers', async () => {
      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente1@example.com',
        phone: '11988888881',
        totalBookings: 0,
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente2@example.com',
        phone: '11988888882',
        totalBookings: 0,
      });

      expect(customer1).toBeDefined();
      expect(customer2).toBeDefined();
      expect(customer1.id).not.toBe(customer2.id);
    });

    test('should persist customer in repository', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);
      const foundCustomer = await customerRepository.findById(createdCustomer.id!);

      expect(foundCustomer).toBeDefined();
      expect(foundCustomer?.id).toBe(createdCustomer.id);
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error if tenant does not exist', async () => {
      const customerData = {
        ...validCustomer,
        tenantId: 'invalid-tenant',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Tenant não encontrado'
      );
    });

    test('should throw error for empty tenant id', async () => {
      const customerData = {
        ...validCustomer,
        tenantId: '',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow();
    });
  });

  describe('Email Uniqueness Validation', () => {
    test('should not allow duplicate email in same tenant', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        totalBookings: 0,
      };

      await createCustomer.execute(customerData);

      await expect(() =>
        createCustomer.execute({
          ...customerData,
          phone: '11900000000',
          totalBookings: 0,
        })
      ).rejects.toThrow('Já existe um cliente com este email neste tenant');
    });

    test('should allow same email in different tenants', async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'salao2@example.com',
        slug: 'salao-2',
      });

      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        phone: '11988888881',
        totalBookings: 0,
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2.id!,
        phone: '11988888882',
        totalBookings: 0,
      });

      expect(customer1).toBeDefined();
      expect(customer2).toBeDefined();
      expect(customer1.tenantId).not.toBe(customer2.tenantId);
      expect(customer1.email).toBe(customer2.email);
    });
  });

  describe('Phone Uniqueness Validation', () => {
    test('should not allow duplicate phone in same tenant', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        totalBookings: 0,
      };

      await createCustomer.execute(customerData);

      await expect(() =>
        createCustomer.execute({
          ...customerData,
          email: 'outro@example.com',
        })
      ).rejects.toThrow('Já existe um cliente com este telefone neste tenant');
    });

    test('should allow same phone in different tenants', async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'salao2@example.com',
        slug: 'salao-2',
      });

      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente1@example.com',
        totalBookings: 0,
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2.id!,
        email: 'cliente2@example.com',
        totalBookings: 0,
      });

      expect(customer1).toBeDefined();
      expect(customer2).toBeDefined();
      expect(customer1.phone).toBe(customer2.phone);
    });
  });

  describe('Entity Validation Errors - Name', () => {
    test('should throw error for empty name', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: '',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Nome é obrigatório'
      );
    });

    test('should throw error for name with only spaces', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: '   ',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Nome é obrigatório'
      );
    });

    test('should throw error for name less than 3 characters', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: 'Ab',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    test('should throw error for name longer than 100 characters', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: 'a'.repeat(101),
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Nome não pode ter mais de 100 caracteres'
      );
    });
  });

  describe('Entity Validation Errors - Email', () => {
    test('should throw error for empty email', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        email: '',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Email é obrigatório'
      );
    });

    test('should throw error for invalid email format', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        email: 'invalid-email',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow('Email inválido');
    });

    test('should accept valid email formats', async () => {
      const validEmails = ['user@example.com', 'user.name@example.com', 'user+tag@example.co.uk'];

      for (const email of validEmails) {
        const customer = await createCustomer.execute({
          ...validCustomer,
          tenantId,
          email,
          phone: `1198888888${validEmails.indexOf(email)}`,
          totalBookings: 0,
        });

        expect(customer.email).toBe(email);
      }
    });
  });

  describe('Entity Validation Errors - Phone', () => {
    test('should throw error for empty phone', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        phone: '',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow(
        'Telefone é obrigatório'
      );
    });

    test('should throw error for invalid phone format', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        phone: '123',
        totalBookings: 0,
      };

      await expect(() => createCustomer.execute(customerData)).rejects.toThrow('Telefone inválido');
    });

    test('should accept valid phone formats', async () => {
      const validPhones = ['11999999999', '11988888888', '21987654321'];

      for (const phone of validPhones) {
        const customer = await createCustomer.execute({
          ...validCustomer,
          tenantId,
          email: `customer${validPhones.indexOf(phone)}@example.com`,
          phone,
          totalBookings: 0,
        });

        expect(customer.phone).toBe(phone);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle name with exactly 3 characters', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: 'Ana',
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.name).toBe('Ana');
    });

    test('should handle name with exactly 100 characters', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: 'a'.repeat(100),
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.name.length).toBe(100);
    });

    test('should handle name with special characters', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        name: 'José da Silva-Júnior',
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.name).toBe('José da Silva-Júnior');
    });

    test('should handle email with multiple dots', async () => {
      const customerData = {
        ...validCustomer,
        tenantId,
        email: 'user.name.test@example.com',
        totalBookings: 0,
      };

      const createdCustomer = await createCustomer.execute(customerData);

      expect(createdCustomer).toBeDefined();
      expect(createdCustomer.email).toBe('user.name.test@example.com');
    });
  });
});
