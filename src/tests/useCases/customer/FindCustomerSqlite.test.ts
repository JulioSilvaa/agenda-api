import { describe, expect, test, beforeEach } from 'vitest';
import crypto from 'crypto';
import { CustomerRepositorySqlite } from '../../../infra/repositories/sqlite/CustomerRepositorySqlite';
import { TenantRepositorySqlite } from '../../../infra/repositories/sqlite/TenantRepositorySqlite';
import { TenantEntity } from '../../../core/entities/TenantEntity';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import FindCustomer from '../../../core/useCases/customer/Find';

process.env.SQLITE_DB_PATH = ':memory:';

describe('UseCase FindCustomer (SQLite)', () => {
  let customerRepo: CustomerRepositorySqlite;
  let tenantRepo: TenantRepositorySqlite;
  let createUC: CreateCustomer;
  let findUC: FindCustomer;
  let tenantId: string;

  beforeEach(async () => {
    customerRepo = new CustomerRepositorySqlite();
    tenantRepo = new TenantRepositorySqlite();
    tenantId = crypto.randomUUID();
    const tenant = TenantEntity.create({
      id: tenantId,
      name: 'Tenant Find',
      slug: 'tenant-find-' + Math.random().toString(16).slice(2),
      email: 'tenantfind' + Math.random().toString(16).slice(2) + '@example.com',
      phone: '11988887777',
      isActive: true,
      address: 'Rua W',
      password: 'Abcdef1!',
    });
    await tenantRepo.create(tenant);
    createUC = new CreateCustomer(customerRepo, tenantRepo);
    findUC = new FindCustomer(customerRepo);
  });

  async function seed() {
    await createUC.execute({
      tenantId,
      name: 'Ana Lima',
      email: 'ana.lima@example.com',
      phone: '11991110001',
      isActive: true,
      totalBookings: 0,
    });
    await createUC.execute({
      tenantId,
      name: 'Bruno Souza',
      email: 'bruno.souza@example.com',
      phone: '11992220002',
      isActive: true,
      totalBookings: 0,
    });
    await createUC.execute({
      tenantId,
      name: 'Carlos Inativo',
      email: 'carlos.inativo@example.com',
      phone: '11993330003',
      isActive: false,
      totalBookings: 0,
    });
  }

  test('should list all customers of tenant', async () => {
    await seed();
    const list = await findUC.execute(tenantId);
    expect(list).toHaveLength(3);
  });

  test('should filter only active', async () => {
    await seed();
    const list = await findUC.execute(tenantId, { onlyActive: true });
    expect(list).toHaveLength(2);
    expect(list.every(c => c.isActive)).toBe(true);
  });

  test('should search by name or email', async () => {
    await seed();
    const listName = await findUC.execute(tenantId, { search: 'bruno' });
    expect(listName).toHaveLength(1);
    expect(listName[0].name).toMatch(/Bruno/);

    const listEmail = await findUC.execute(tenantId, { search: 'ana.lima@' });
    expect(listEmail).toHaveLength(1);
    expect(listEmail[0].email).toMatch(/ana.lima/);
  });

  test('should sort by name', async () => {
    await seed();
    const list = await findUC.execute(tenantId, { sortBy: 'name' });
    const names = list.map(c => c.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});
