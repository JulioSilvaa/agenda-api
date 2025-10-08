import { describe, expect, test, beforeEach } from 'vitest';
import crypto from 'crypto';
import { CustomerRepositorySqlite } from '../../../infra/repositories/sqlite/CustomerRepositorySqlite';
import { TenantRepositorySqlite } from '../../../infra/repositories/sqlite/TenantRepositorySqlite';
import { TenantEntity } from '../../../core/entities/TenantEntity';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import UpdateCustomer from '../../../core/useCases/customer/Update';
import { CustomerEntity } from '../../../core/entities/CustomerEntity';

process.env.SQLITE_DB_PATH = ':memory:';

describe('UseCase UpdateCustomer (SQLite)', () => {
  let customerRepo: CustomerRepositorySqlite;
  let tenantRepo: TenantRepositorySqlite;
  let createUC: CreateCustomer;
  let updateUC: UpdateCustomer;
  let tenantId: string;

  beforeEach(async () => {
    customerRepo = new CustomerRepositorySqlite();
    tenantRepo = new TenantRepositorySqlite();
    tenantId = crypto.randomUUID();
    const tenant = TenantEntity.create({
      id: tenantId,
      name: 'Tenant Upd',
      slug: 'tenant-upd-' + Math.random().toString(16).slice(2),
      email: 'tenantupd' + Math.random().toString(16).slice(2) + '@example.com',
      phone: '11988887777',
      isActive: true,
      address: 'Rua Y',
      password: 'Abcdef1!',
    });
    await tenantRepo.create(tenant);
    createUC = new CreateCustomer(customerRepo, tenantRepo);
    updateUC = new UpdateCustomer(customerRepo);
  });

  test('should update name successfully', async () => {
    const created = await createUC.execute({
      tenantId,
      name: 'Nome Original',
      email: 'original@example.com',
      phone: '11995556666',
      isActive: true,
      totalBookings: 0,
    });

    const updatedEntity = CustomerEntity.create({
      id: created.id!,
      tenantId: created.tenantId,
      name: 'Nome Alterado',
      email: created.email ?? undefined,
      phone: created.phone,
      isActive: created.isActive,
      totalBookings: created.totalBookings,
      createdAt: created.createdAt,
      updatedAt: new Date(),
    });

    const updated = await updateUC.execute(updatedEntity);
    expect(updated.name).toBe('Nome Alterado');
  });

  test('should reject duplicate email (other customer)', async () => {
    const first = await createUC.execute({
      tenantId,
      name: 'Primeiro',
      email: 'dupemail@example.com',
      phone: '11992223333',
      isActive: true,
      totalBookings: 0,
    });
    const second = await createUC.execute({
      tenantId,
      name: 'Segundo',
      email: 'other@example.com',
      phone: '11992224444',
      isActive: true,
      totalBookings: 0,
    });

    const updatedSecond = CustomerEntity.create({
      id: second.id!,
      tenantId: second.tenantId,
      name: second.name,
      email: 'dupemail@example.com',
      phone: second.phone,
      isActive: second.isActive,
      totalBookings: second.totalBookings,
      createdAt: second.createdAt,
      updatedAt: new Date(),
    });

    await expect(updateUC.execute(updatedSecond)).rejects.toThrow(
      'Já existe um cliente com este email neste tenant'
    );
  });

  test('should reject duplicate phone (other customer)', async () => {
    const first = await createUC.execute({
      tenantId,
      name: 'Primeiro',
      email: 'phonea@example.com',
      phone: '11993334444',
      isActive: true,
      totalBookings: 0,
    });
    const second = await createUC.execute({
      tenantId,
      name: 'Segundo',
      email: 'phoneb@example.com',
      phone: '11994445555',
      isActive: true,
      totalBookings: 0,
    });

    const updatedSecond = CustomerEntity.create({
      id: second.id!,
      tenantId: second.tenantId,
      name: second.name,
      email: second.email ?? undefined,
      phone: first.phone, // duplicado
      isActive: second.isActive,
      totalBookings: second.totalBookings,
      createdAt: second.createdAt,
      updatedAt: new Date(),
    });

    await expect(updateUC.execute(updatedSecond)).rejects.toThrow(
      'Já existe um cliente com este telefone neste tenant'
    );
  });
});
