import { describe, expect, test, beforeEach } from 'vitest';
import { CustomerRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateCustomer } from '../../../../core/useCases/customer/Create';
import { CreateTenant } from '../../../../core/useCases/tenant/Create';
import FindCustomer from '../../../../core/useCases/customer/Find';
import { CustomerEntity } from '../../../../core/entities/CustomerEntity';
describe('Unit test ListCustomers UseCase', () => {
  let customerRepository: CustomerRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createCustomer: CreateCustomer;
  let createTenant: CreateTenant;
  let listCustomers: FindCustomer;
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
    listCustomers = new FindCustomer(customerRepository);
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

  describe('Successful Listing', () => {
    test('should list all customers for a tenant', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11988888881',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888882',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente 3',
        email: 'cliente3@example.com',
        phone: '11988888883',
        totalBookings: 0,
      });

      const customers = (await listCustomers.execute(tenantId)) as unknown as CustomerEntity[];

      expect(Array.isArray(customers)).toBe(true);
      expect(customers).toHaveLength(3);
      expect(customers[0]?.name).toBe('Cliente 1');
      expect(customers[1]?.name).toBe('Cliente 2');
      expect(customers[2]?.name).toBe('Cliente 3');
    });

    test('should return empty array when tenant has no customers', async () => {
      const customers = (await listCustomers.execute(tenantId)) as unknown as CustomerEntity[];
      expect(customers).toHaveLength(0);
      expect(Array.isArray(customers)).toBe(true);
    });

    test('should list only active customers', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente Ativo',
        email: 'ativo@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente Inativo',
        email: 'inativo@example.com',
        phone: '11988888882',
        isActive: false,
        totalBookings: 0,
      });

      const customers = (await listCustomers.execute(tenantId, {
        onlyActive: true,
      })) as unknown as CustomerEntity[];

      expect(Array.isArray(customers)).toBe(true);
      expect(customers).toHaveLength(1);
      expect(customers[0].name).toBe('Cliente Ativo');
      expect(customers[0].isActive).toBe(true);
    });

    test('should list all customers including inactive ones', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente Ativo',
        email: 'ativo@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente Inativo',
        email: 'inativo@example.com',
        phone: '11988888882',
        isActive: false,
        totalBookings: 0,
      });

      const customers = await listCustomers.execute(tenantId);

      expect(customers).toHaveLength(2);
    });
  });

  describe('Tenant Isolation', () => {
    test('should not list customers from other tenants', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente Tenant 1',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        name: 'Cliente Tenant 2',
        email: 'outro@example.com',
        phone: '11977777777',
        totalBookings: 0,
      });

      const customers = (await listCustomers.execute(tenantId)) as unknown as CustomerEntity[];

      expect(Array.isArray(customers)).toBe(true);
      expect(customers).not.toBeNull();
      expect(customers).toHaveLength(1);
      expect(customers[0].tenantId).toBe(tenantId);
      expect(customers[0].name).toBe('Cliente Tenant 1');
    });

    test('should return independent lists for different tenants', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente 1',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888882',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        name: 'Cliente 3',
        email: 'cliente3@example.com',
        phone: '11988888883',
        totalBookings: 0,
      });

      const tenant1Customers = await listCustomers.execute(tenantId);
      const tenant2Customers = await listCustomers.execute(tenant2Id);

      expect(tenant1Customers).toHaveLength(1);
      expect(tenant2Customers).toHaveLength(2);
    });
  });

  describe('Sorting and Filtering', () => {
    test('should list customers ordered by name', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Zebra Silva',
        email: 'zebra@example.com',
        phone: '11988888881',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Ana Costa',
        email: 'ana@example.com',
        phone: '11988888882',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Bruno Souza',
        email: 'bruno@example.com',
        phone: '11988888883',
        totalBookings: 0,
      });

      const customers = (await listCustomers.execute(tenantId, {
        sortBy: 'name',
      })) as unknown as CustomerEntity[];

      expect(Array.isArray(customers)).toBe(true);
      expect(customers[0]?.name).toBe('Ana Costa');
      expect(customers[1]?.name).toBe('Bruno Souza');
      expect(customers[2]?.name).toBe('Zebra Silva');
    });

    test('should filter customers by name search', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '11988888881',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '11988888882',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Pedro Costa',
        email: 'pedro@example.com',
        phone: '11988888883',
        totalBookings: 0,
      });

      const customers = ((await listCustomers.execute(tenantId, {
        search: 'Silva',
      })) ?? []) as CustomerEntity[];

      expect(customers).toHaveLength(2);
      expect(customers[0].name).toBe('João Silva');
      expect(customers[1].name).toBe('Maria Silva');
    });

    test('should filter customers by email search', async () => {
      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'joao@gmail.com',
        phone: '11988888881',
        totalBookings: 0,
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'Cliente 2',
        email: 'maria@hotmail.com',
        phone: '11988888882',
        totalBookings: 0,
      });

      const customers = ((await listCustomers.execute(tenantId, {
        search: 'gmail',
      })) ?? []) as CustomerEntity[];

      expect(customers).toHaveLength(1);
      expect(customers[0].email).toBe('joao@gmail.com');
    });
  });

  describe('Edge Cases', () => {
    test('should handle large number of customers', async () => {
      for (let i = 0; i < 20; i++) {
        await createCustomer.execute({
          ...validCustomer,
          tenantId,
          name: `Cliente ${i}`,
          email: `cliente${i}@example.com`,
          phone: `1198888${String(i).padStart(4, '0')}`,
          totalBookings: 0,
        });
      }

      const customers = await listCustomers.execute(tenantId);

      expect(customers).toHaveLength(20);
    });

    test('should preserve all customer properties', async () => {
      return await createCustomer.execute({
        ...validCustomer,
        tenantId,
        name: 'João da Silva',
        email: 'joao@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
      });

      const customers = ((await listCustomers.execute(tenantId)) ?? []) as CustomerEntity[];

      expect(customers).toHaveLength(1);
      const customer = customers[0];
      expect(customer.name).toBe('João da Silva');
      expect(customer.email).toBe('joao@example.com');
      expect(customer.phone).toBe('11988888888');
      expect(customer.isActive).toBe(true);
      expect(customer.createdAt).toBeInstanceOf(Date);
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });
  });
});
