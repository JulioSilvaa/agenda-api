import { describe, expect, test, beforeEach } from 'vitest';
import crypto from 'crypto';
import { CustomerEntity } from '../../../../src/core/entities/CustomerEntity';
import { CustomerRepositorySqlite } from '../../../../src/infra/repositories/sqlite/CustomerRepositorySqlite';

process.env.SQLITE_DB_PATH = ':memory:';

describe('Integration test CustomerRepositorySqlite', () => {
  let repository: CustomerRepositorySqlite;
  const tenantId = 'tenant-sql-1';
  const tenant2Id = 'tenant-sql-2';

  beforeEach(() => {
    repository = new CustomerRepositorySqlite();
  });

  function makeCustomer(
    overrides: Partial<{
      id: string;
      tenantId: string;
      name: string;
      email: string;
      phone: string;
      isActive: boolean;
      totalBookings: number;
      createdAt: Date;
      updatedAt: Date;
    }> = {}
  ) {
    const now = new Date();
    return CustomerEntity.create({
      id: overrides.id ?? crypto.randomUUID(),
      tenantId: overrides.tenantId ?? tenantId,
      name: overrides.name ?? 'Cliente Teste',
      email:
        overrides.email ?? 'cliente.teste' + Math.random().toString(16).slice(2) + '@example.com',
      phone: overrides.phone ?? '119' + Math.floor(10000000 + Math.random() * 89999999).toString(),
      isActive: overrides.isActive ?? true,
      totalBookings: overrides.totalBookings ?? 0,
      createdAt: overrides.createdAt ?? now,
      updatedAt: overrides.updatedAt ?? now,
    });
  }

  describe('Create', () => {
    test('should create customer successfully and return persisted row', async () => {
      const customer = makeCustomer({ email: 'create.persist@example.com' });
      const created = await repository.create(customer);
      expect(created).toBeDefined();
      expect(created.id).toBe(customer.id);
      expect(created.email).toBe('create.persist@example.com');
    });

    test('should create multiple customers and retrieve by id', async () => {
      const c1 = await repository.create(makeCustomer({ name: 'Cliente Um' }));
      const c2 = await repository.create(makeCustomer({ name: 'Cliente Dois' }));
      const f1 = await repository.findById(c1.id!);
      const f2 = await repository.findById(c2.id!);
      expect(f1?.name).toBe('Cliente Um');
      expect(f2?.name).toBe('Cliente Dois');
    });
  });

  describe('Update', () => {
    test('should update existing customer', async () => {
      const c = await repository.create(makeCustomer({ name: 'Original' }));
      const updatedEntity = CustomerEntity.create({
        id: c.id!,
        tenantId: c.tenantId,
        name: 'Alterado',
        email: c.email ?? undefined,
        phone: c.phone,
        isActive: c.isActive,
        totalBookings: c.totalBookings,
        createdAt: c.createdAt,
        updatedAt: new Date(),
      });
      const updated = await repository.update(updatedEntity);
      expect(updated.name).toBe('Alterado');
    });

    test('should throw when updating non-existent customer', async () => {
      const fake = makeCustomer({ id: 'nao-existe', email: 'naoexiste@example.com' });
      await expect(repository.update(fake)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('Delete', () => {
    test('should delete customer', async () => {
      const c = await repository.create(makeCustomer({ name: 'Para deletar' }));
      await repository.delete(c.id!);
      const found = await repository.findById(c.id!);
      expect(found).toBeNull();
    });

    test('delete on non-existent id should not throw', async () => {
      await expect(repository.delete('id-invalido')).resolves.not.toThrow();
    });
  });

  describe('FindById', () => {
    test('should return customer', async () => {
      const c = await repository.create(makeCustomer({ name: 'FindById' }));
      const found = await repository.findById(c.id!);
      expect(found?.id).toBe(c.id);
    });

    test('should return null for unknown id', async () => {
      const found = await repository.findById('desconhecido');
      expect(found).toBeNull();
    });
  });

  describe('FindByTenantId', () => {
    test('should isolate customers per tenant', async () => {
      await repository.create(makeCustomer({ tenantId, name: 'Tenant1-C1' }));
      await repository.create(makeCustomer({ tenantId: tenant2Id, name: 'Tenant2-C1' }));
      const list1 = await repository.findByTenantId(tenantId);
      const list2 = await repository.findByTenantId(tenant2Id);
      expect(list1.every((c: CustomerEntity) => c.tenantId === tenantId)).toBe(true);
      expect(list2.every((c: CustomerEntity) => c.tenantId === tenant2Id)).toBe(true);
    });

    test('should return empty array when no customers', async () => {
      const list = await repository.findByTenantId('vazio');
      expect(list).toHaveLength(0);
    });
  });

  describe('FindByEmail', () => {
    test('should find by email within tenant', async () => {
      const email = 'email.unique@example.com';
      await repository.create(makeCustomer({ email }));
      const found = await repository.findByEmail(email, tenantId);
      expect(found?.email).toBe(email);
      expect(found?.tenantId).toBe(tenantId);
    });

    test('should return null if email not found', async () => {
      const found = await repository.findByEmail('nao@existe.com', tenantId);
      expect(found).toBeNull();
    });

    test('should differentiate same email in different tenants', async () => {
      const shared = 'same@example.com';
      await repository.create(makeCustomer({ email: shared, tenantId }));
      await repository.create(makeCustomer({ email: shared, tenantId: tenant2Id }));
      const f1 = await repository.findByEmail(shared, tenantId);
      const f2 = await repository.findByEmail(shared, tenant2Id);
      expect(f1?.tenantId).toBe(tenantId);
      expect(f2?.tenantId).toBe(tenant2Id);
      expect(f1?.id).not.toBe(f2?.id);
    });
  });

  describe('FindByPhone', () => {
    test('should find by phone within tenant', async () => {
      const phone = '11970000000';
      await repository.create(makeCustomer({ phone }));
      const found = await repository.findByPhone(phone, tenantId);
      expect(found?.phone).toBe(phone);
      expect(found?.tenantId).toBe(tenantId);
    });

    test('should return null if phone not found', async () => {
      const found = await repository.findByPhone('11999999999', tenantId);
      expect(found).toBeNull();
    });

    test('should differentiate same phone across tenants', async () => {
      const phone = '11981110000';
      await repository.create(makeCustomer({ phone, tenantId }));
      await repository.create(makeCustomer({ phone, tenantId: tenant2Id }));
      const f1 = await repository.findByPhone(phone, tenantId);
      const f2 = await repository.findByPhone(phone, tenant2Id);
      expect(f1?.tenantId).toBe(tenantId);
      expect(f2?.tenantId).toBe(tenant2Id);
      expect(f1?.id).not.toBe(f2?.id);
    });
  });
});
