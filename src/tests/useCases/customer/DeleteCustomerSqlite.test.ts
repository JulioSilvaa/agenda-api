import { describe, expect, test, beforeEach } from 'vitest';
import crypto from 'crypto';
import { CustomerRepositorySqlite } from '../../../infra/repositories/sqlite/CustomerRepositorySqlite';
import { TenantRepositorySqlite } from '../../../infra/repositories/sqlite/TenantRepositorySqlite';
import { TenantEntity } from '../../../core/entities/TenantEntity';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import { DeleteCustomer } from '../../../core/useCases/customer/Delete';

process.env.SQLITE_DB_PATH = ':memory:';

describe('UseCase DeleteCustomer (SQLite)', () => {
  let customerRepo: CustomerRepositorySqlite;
  let tenantRepo: TenantRepositorySqlite;
  let createUC: CreateCustomer;
  let deleteUC: DeleteCustomer;
  let tenantId: string;

  beforeEach(async () => {
    customerRepo = new CustomerRepositorySqlite();
    tenantRepo = new TenantRepositorySqlite();
    tenantId = crypto.randomUUID();
    const tenant = TenantEntity.create({
      id: tenantId,
      name: 'Tenant Del',
      slug: 'tenant-del-' + Math.random().toString(16).slice(2),
      email: 'tenantdel' + Math.random().toString(16).slice(2) + '@example.com',
      phone: '11988887777',
      isActive: true,
      address: 'Rua Z',
      password: 'Abcdef1!',
    });
    await tenantRepo.create(tenant);
    createUC = new CreateCustomer(customerRepo, tenantRepo);
    deleteUC = new DeleteCustomer(customerRepo);
  });

  test('should delete existing customer', async () => {
    const created = await createUC.execute({
      tenantId,
      name: 'Deletável',
      email: 'del@example.com',
      phone: '11997776666',
      isActive: true,
      totalBookings: 0,
    });
    await deleteUC.execute(created.id!, tenantId);
    const found = await customerRepo.findById(created.id!);
    expect(found).toBeNull();
  });

  test('should not delete if tenant mismatch', async () => {
    const created = await createUC.execute({
      tenantId,
      name: 'Errado Tenant',
      email: 'wrongtenant@example.com',
      phone: '11996665555',
      isActive: true,
      totalBookings: 0,
    });
    await expect(deleteUC.execute(created.id!, 'outro-tenant')).rejects.toThrow(
      'Cliente não pertence a este tenant'
    );
  });

  test('should throw if customer not found', async () => {
    await expect(deleteUC.execute('nao-existe', tenantId)).rejects.toThrow(
      'Cliente não encontrado'
    );
  });
});
