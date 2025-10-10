import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '../../../infra/db/prismaClient';
import { TenantRepositorySQL } from '../../../infra/repositories/repositoryInSQL/TenantRepositorySQL';
import { ITenantRepository } from '../../../core/repositories/TenantRepository';
import { TenantEntity } from '../../../core/entities/TenantEntity';

describe('Integration test TenantRepositorySQL (Prisma)', () => {
  let repository: ITenantRepository;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    repository = new TenantRepositorySQL();
    // limpeza leve por email/slug de teste
    await prisma.tenant.deleteMany({
      where: {
        OR: [{ email: { contains: '@it-test.example.com' } }, { slug: { startsWith: 'it-test-' } }],
      },
    });
  });

  const makeTenant = (suffix: string) =>
    TenantEntity.create({
      name: `Tenant ${suffix}`,
      slug: `it-test-${suffix}`,
      email: `tenant-${suffix}@it-test.example.com`,
      phone: '11999999999',
      isActive: true,
      address: 'Rua Teste, 123',
      password: 'Senha#123',
    });

  it('should create and retrieve by email', async () => {
    const tenant = makeTenant('create');
    const created = await repository.create(tenant);
    expect(created.id).toBeTruthy();
    expect(created.email).toBe(tenant.email);

    const found = await repository.findByEmail(tenant.email!);
    expect(found).not.toBeNull();
    expect(found?.slug).toBe(tenant.slug);
  });

  it('should find by id', async () => {
    const tenant = makeTenant('find-by-id');
    const created = await repository.create(tenant);

    const found = await repository.findById(created.id!);
    expect(found?.id).toBe(created.id);
    expect(found?.email).toBe(tenant.email);
  });

  it('should update tenant data', async () => {
    const tenant = makeTenant('update');
    const created = await repository.create(tenant);

    const updatedEntity = TenantEntity.create({
      id: created.id!,
      name: 'Tenant Atualizado',
      slug: 'it-test-update-updated',
      email: 'tenant-update-updated@it-test.example.com',
      phone: '11988888888',
      isActive: false,
      address: 'Av. Nova, 456',
      password: 'Senha#123',
    });

    const updated = await repository.update(updatedEntity);
    expect(updated.name).toBe('Tenant Atualizado');
    expect(updated.slug).toBe('it-test-update-updated');
    expect(updated.isActive).toBe(false);

    const fromDb = await repository.findById(created.id!);
    expect(fromDb?.name).toBe('Tenant Atualizado');
  });

  it('should delete tenant', async () => {
    const tenant = makeTenant('delete');
    const created = await repository.create(tenant);

    await repository.delete(created.id!);
    const found = await repository.findById(created.id!);
    expect(found).toBeNull();
  });
});
