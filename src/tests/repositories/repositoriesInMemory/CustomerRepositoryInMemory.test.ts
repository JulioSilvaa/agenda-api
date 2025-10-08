import { describe, expect, test, beforeEach } from 'vitest';
import { CustomerRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory';
import { CustomerEntity } from '../../../core/entities/CustomerEntity';

describe('Unit test CustomerRepositoryInMemory', () => {
  let repository: CustomerRepositoryInMemory;
  const tenantId = 'tenant-123';
  const tenant2Id = 'tenant-456';

  beforeEach(() => {
    repository = new CustomerRepositoryInMemory();
  });

  describe('Create', () => {
    test('should create customer successfully', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'João da Silva',
        email: 'joao@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(customer);

      expect(created).toBeDefined();
      expect(created.id).toBe(customer.id);
      expect(created.name).toBe('João da Silva');
    });

    test('should create multiple customers', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888882',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);

      const found1 = await repository.findById(customer1.id!);
      const found2 = await repository.findById(customer2.id!);

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });
  });

  describe('Update', () => {
    test('should update customer successfully', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Original',
        email: 'original@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer);

      const updated = CustomerEntity.create({
        id: customer.id!,
        tenantId: customer.tenantId,
        name: 'Atualizado',
        email: customer.email ?? undefined,
        phone: customer.phone,
        isActive: customer.isActive,
        totalBookings: customer.totalBookings,
        createdAt: customer.createdAt,
        updatedAt: new Date(),
      });

      const result = await repository.update(updated);

      expect(result.name).toBe('Atualizado');
    });

    test('should throw error when updating non-existent customer', async () => {
      const customer = CustomerEntity.create({
        id: 'non-existent',
        tenantId,
        name: 'Teste',
        email: 'teste@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(() => repository.update(customer)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('Delete', () => {
    test('should delete customer successfully', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Para Deletar',
        email: 'deletar@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer);
      await repository.delete(customer.id!);

      const found = await repository.findById(customer.id!);
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent customer', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });

    test('should only delete specified customer', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888882',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);

      await repository.delete(customer1.id!);

      const found1 = await repository.findById(customer1.id!);
      const found2 = await repository.findById(customer2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });
  });

  describe('FindById', () => {
    test('should find customer by id', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Teste',
        email: 'teste@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer);
      const found = await repository.findById(customer.id!);

      expect(found).toBeDefined();
      expect(found?.id).toBe(customer.id);
      expect(found?.name).toBe('Teste');
    });

    test('should return null when customer not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('FindByTenantId', () => {
    test('should find all customers for a tenant', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888882',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);

      const customers = await repository.findByTenantId(tenantId);

      expect(customers).toHaveLength(2);
      expect(customers[0].tenantId).toBe(tenantId);
      expect(customers[1].tenantId).toBe(tenantId);
    });

    test('should return empty array when tenant has no customers', async () => {
      const customers = await repository.findByTenantId('empty-tenant');
      expect(customers).toHaveLength(0);
      expect(Array.isArray(customers)).toBe(true);
    });

    test('should isolate customers by tenant', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Tenant 1 Customer',
        email: 'tenant1@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        name: 'Tenant 2 Customer',
        email: 'tenant2@example.com',
        phone: '11988888882',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);

      const tenant1Customers = await repository.findByTenantId(tenantId);
      const tenant2Customers = await repository.findByTenantId(tenant2Id);

      expect(tenant1Customers).toHaveLength(1);
      expect(tenant2Customers).toHaveLength(1);
      expect(tenant1Customers[0].name).toBe('Tenant 1 Customer');
      expect(tenant2Customers[0].name).toBe('Tenant 2 Customer');
    });
  });

  describe('FindByEmail', () => {
    test('should find customer by email and tenantId', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'João',
        email: 'joao@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer);
      const found = await repository.findByEmail('joao@example.com', tenantId);

      expect(found).toBeDefined();
      expect(found?.email).toBe('joao@example.com');
      expect(found?.tenantId).toBe(tenantId);
    });

    test('should return null when email not found', async () => {
      const found = await repository.findByEmail('naoexiste@example.com', tenantId);
      expect(found).toBeNull();
    });

    test('should isolate email search by tenant', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'mesmo@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        name: 'Cliente 2',
        email: 'mesmo@example.com',
        phone: '11988888882',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);

      const foundTenant1 = await repository.findByEmail('mesmo@example.com', tenantId);
      const foundTenant2 = await repository.findByEmail('mesmo@example.com', tenant2Id);

      expect(foundTenant1).toBeDefined();
      expect(foundTenant2).toBeDefined();
      expect(foundTenant1?.id).toBe(customer1.id);
      expect(foundTenant2?.id).toBe(customer2.id);
    });
  });

  describe('FindByPhone', () => {
    test('should find customer by phone and tenantId', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'João',
        email: 'joao@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer);
      const found = await repository.findByPhone('11988888888', tenantId);

      expect(found).toBeDefined();
      expect(found?.phone).toBe('11988888888');
      expect(found?.tenantId).toBe(tenantId);
    });

    test('should return null when phone not found', async () => {
      const found = await repository.findByPhone('99999999999', tenantId);
      expect(found).toBeNull();
    });

    test('should isolate phone search by tenant', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);

      const foundTenant1 = await repository.findByPhone('11988888888', tenantId);
      const foundTenant2 = await repository.findByPhone('11988888888', tenant2Id);

      expect(foundTenant1).toBeDefined();
      expect(foundTenant2).toBeDefined();
      expect(foundTenant1?.id).toBe(customer1.id);
      expect(foundTenant2?.id).toBe(customer2.id);
    });
  });

  describe('findAll', () => {
    test('should return all customers', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11999999999',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888888',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.create(customer1);
      await repository.create(customer2);
      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(all.map((c: typeof customer1) => c.name)).toContain('Cliente 1');
      expect(all.map((c: typeof customer2) => c.name)).toContain('Cliente 2');
    });
  });

  describe('Edge Cases', () => {
    test('should handle inactive customers', async () => {
      const customer = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente Inativo',
        email: 'inativo@example.com',
        phone: '11988888888',
        isActive: false,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer);
      const found = await repository.findById(customer.id!);

      expect(found?.isActive).toBe(false);
    });

    test('should maintain customer list after multiple operations', async () => {
      const customer1 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '11988888881',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const customer2 = CustomerEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '11988888882',
        isActive: true,
        totalBookings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(customer1);
      await repository.create(customer2);
      await repository.delete(customer1.id!);

      const customers = await repository.findByTenantId(tenantId);
      expect(customers).toHaveLength(1);
      expect(customers[0].id).toBe(customer2.id);
    });
  });
});
