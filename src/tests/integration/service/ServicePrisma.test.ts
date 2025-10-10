import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '../../../infra/db/prismaClient';
import { ServiceRepositorySQL } from '../../../infra/repositories/repositoryInSQL/ServiceRepositorySQL';
import { IServiceRepository } from '../../../core/repositories/ServiceRepository';
import { ServiceEntity } from '../../../core/entities/ServiceEntity';

describe('Integration test ServiceRepositorySQL (Prisma)', () => {
  let repository: IServiceRepository;
  const tenantId = 'tenant-service-1';

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    repository = new ServiceRepositorySQL();
    await prisma.booking.deleteMany({ where: { tenantId } });
    await prisma.service.deleteMany({ where: { tenantId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Tenant Service',
        slug: 'tenant-service',
        email: 'tenant-service@it-test.example.com',
        isActive: true,
        password: 'hashed',
      },
    });
  });

  const makeService = (suffix: string) =>
    ServiceEntity.create({
      id: undefined as any,
      tenantId,
      name: `Corte ${suffix}`,
      description: 'Corte de cabelo',
      price: 50,
      durationMinutes: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  it('should create and retrieve by id', async () => {
    const svc = makeService('create');
    const created = await repository.create(svc);
    expect(created.id).toBeTruthy();

    const found = await repository.findById(created.id!);
    expect(found?.name).toBe('Corte create');
  });

  it('should update service', async () => {
    const svc = makeService('update');
    const created = await repository.create(svc);

    const updatedEntity = ServiceEntity.create({
      id: created.id!,
      tenantId,
      name: 'Barba completa',
      description: 'Barba e acabamento',
      price: 70,
      durationMinutes: 45,
      isActive: false,
      createdAt: created.createdAt,
      updatedAt: new Date(),
    });

    const updated = await repository.update(updatedEntity);
    expect(updated.name).toBe('Barba completa');
    expect(updated.isActive).toBe(false);
  });

  it('should find by name within tenant', async () => {
    const a = makeService('A');
    const b = makeService('B');
    await repository.create(a);
    await repository.create(b);

    const found = await repository.findByName('Corte B', tenantId);
    expect(found?.name).toBe('Corte B');
  });

  it('should list all', async () => {
    await prisma.service.deleteMany({ where: { tenantId } });
    await repository.create(makeService('1'));
    await repository.create(makeService('2'));
    await repository.create(makeService('3'));

    const list = await repository.findAll();
    expect(list.length).toBeGreaterThanOrEqual(3);
  });

  it('should delete service', async () => {
    const svc = makeService('delete');
    const created = await repository.create(svc);
    await repository.delete(created.id!);

    const found = await repository.findById(created.id!);
    expect(found).toBeNull();
  });
});
