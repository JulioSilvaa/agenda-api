import { describe, test, expect } from 'vitest';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
import { DeleteTenant } from '../../../core/useCases/tenant/Delete';

describe('Unit test DeleteTenant UseCase', () => {
  const validTenant = {
    name: 'Empresa Teste',
    email: 'teste@empresa.com',
    slug: 'empresa-teste',
    phone: '11999999999',
    password: 'Senha#123',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  test('should delete an existing tenant', async () => {
    const tenantRepository = new TenantRepositoryInMemory();
    const createTenant = new CreateTenant(tenantRepository);
    const deleteTenant = new DeleteTenant(tenantRepository);

    const created = await createTenant.execute(validTenant);
    const foundBeforeDelete = await tenantRepository.findById(created.id!);
    expect(foundBeforeDelete).toBeDefined();

    await deleteTenant.execute(created.id!);
    const foundAfterDelete = await tenantRepository.findById(created.id!);
    expect(foundAfterDelete).toBeNull();
  });

  test('should throw error when trying to delete non-existing tenant', async () => {
    const tenantRepository = new TenantRepositoryInMemory();
    const deleteTenant = new DeleteTenant(tenantRepository);

    await expect(() => deleteTenant.execute('non-existent-id')).rejects.toThrow(
      'Tenant não encontrado'
    );
  });
  test('should delete multiple tenants independently', async () => {
    const tenantRepository = new TenantRepositoryInMemory();
    const createTenant = new CreateTenant(tenantRepository);
    const deleteTenant = new DeleteTenant(tenantRepository);

    const tenant1 = await createTenant.execute({
      ...validTenant,
      email: 't1@empresa.com',
      slug: 'empresa-t1',
    });

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: 't2@empresa.com',
      slug: 'empresa-t2',
    });

    await deleteTenant.execute(tenant1.id!);

    const foundTenant1 = await tenantRepository.findById(tenant1.id!);
    const foundTenant2 = await tenantRepository.findById(tenant2.id!);

    expect(foundTenant1).toBeNull();
    expect(foundTenant2).toBeDefined();
  });
});
