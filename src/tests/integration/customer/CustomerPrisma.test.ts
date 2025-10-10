import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '../../../infra/db/prismaClient';
import { CustomerRepositorySQL } from '../../../infra/repositories/repositoryInSQL/CustomerRepositorySQL';
import { ICustomerRepository } from '../../../core/repositories/CustomerRepository';
import { CustomerEntity } from '../../../core/entities/CustomerEntity';

describe('Integration test CustomerRepositorySQL (Prisma)', () => {
  let repository: ICustomerRepository;
  const tenantId = 'tenant-customer-1';

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    repository = new CustomerRepositorySQL();
    await prisma.booking.deleteMany({ where: { tenantId } });
    await prisma.customer.deleteMany({ where: { tenantId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Tenant Customer',
        slug: 'tenant-customer',
        email: 'tenant-customer@it-test.example.com',
        isActive: true,
        password: 'hashed',
      },
    });
  });

  const makeCustomer = (suffix: string, isActive = true) =>
    CustomerEntity.create({
      id: undefined as any,
      tenantId,
      name: `Cliente ${suffix}`,
      email: `cliente-${suffix}@it-test.example.com`,
      phone: '11999999999',
      isActive,
      totalBookings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it('should create and find by id', async () => {
    const c = makeCustomer('create');
    const created = await repository.create(c);
    const found = await repository.findById(created.id!);
    expect(found?.email).toBe('cliente-create@it-test.example.com');
  });

  it('should update customer', async () => {
    const c = makeCustomer('update');
    const created = await repository.create(c);
    const updatedEntity = CustomerEntity.create({
      id: created.id!,
      tenantId,
      name: 'Cliente Atualizado',
      email: 'cliente-updated@it-test.example.com',
      phone: '11988888888',
      isActive: false,
      totalBookings: 2,
      createdAt: created.createdAt,
      updatedAt: new Date(),
    });
    const updated = await repository.update(updatedEntity);
    expect(updated.name).toBe('Cliente Atualizado');
    expect(updated.isActive).toBe(false);
    expect(updated.totalBookings).toBe(2);
  });

  it('should find by email and phone', async () => {
    const c = makeCustomer('lookup');
    await repository.create(c);

    const byEmail = await repository.findByEmail('cliente-lookup@it-test.example.com', tenantId);
    expect(byEmail?.name).toBe('Cliente lookup');

    const byPhone = await repository.findByPhone('11999999999', tenantId);
    expect(byPhone?.email).toBe('cliente-lookup@it-test.example.com');
  });

  it('should list by tenant and all', async () => {
    await repository.create(makeCustomer('1'));
    await repository.create(makeCustomer('2'));
    await repository.create(makeCustomer('3'));

    const byTenant = await repository.findByTenantId(tenantId);
    expect(byTenant.length).toBe(3);

    const all = await repository.findAll();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it('should delete customer', async () => {
    const c = makeCustomer('delete');
    const created = await repository.create(c);
    await repository.delete(created.id!);
    const found = await repository.findById(created.id!);
    expect(found).toBeNull();
  });
});
