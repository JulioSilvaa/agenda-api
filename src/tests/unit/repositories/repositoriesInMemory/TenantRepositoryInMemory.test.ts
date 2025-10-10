import { describe, expect, test, beforeEach } from 'vitest';
import { TenantRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { TenantEntity } from '../../../../core/entities/TenantEntity';

describe('Unit test TenantRepositoryInMemory', () => {
  let repository: TenantRepositoryInMemory;

  beforeEach(() => {
    repository = new TenantRepositoryInMemory();
  });

  const validTenantData = {
    name: 'Empresa Teste',
    email: 'teste@empresa.com',
    slug: 'empresa-teste',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
    password: 'Senha#123',
  };

  describe('create', () => {
    test('should create and return tenant', async () => {
      const tenant = TenantEntity.create(validTenantData);
      const createdTenant = await repository.create(tenant);

      expect(createdTenant).toBeDefined();
      expect(createdTenant.email).toBe(validTenantData.email);
      expect(createdTenant.name).toBe(validTenantData.name);
    });

    test('should create multiple tenants', async () => {
      const tenant1 = TenantEntity.create(validTenantData);
      const tenant2 = TenantEntity.create({
        ...validTenantData,
        email: 'outro@empresa.com',
        slug: 'outro-slug',
      });

      await repository.create(tenant1);
      await repository.create(tenant2);

      const found1 = await repository.findByEmail(tenant1.email!);
      const found2 = await repository.findByEmail(tenant2.email!);

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });

    test('should preserve all tenant properties', async () => {
      const tenant = TenantEntity.create(validTenantData);
      const createdTenant = await repository.create(tenant);

      expect(createdTenant.name).toBe(validTenantData.name);
      expect(createdTenant.email).toBe(validTenantData.email);
      expect(createdTenant.slug).toBe(validTenantData.slug);
      expect(createdTenant.phone).toBe(validTenantData.phone);
      expect(createdTenant.isActive).toBe(validTenantData.isActive);
      expect(createdTenant.address).toBe(validTenantData.address);
    });
  });

  describe('findByEmail', () => {
    test('should find tenant by email', async () => {
      const tenant = TenantEntity.create(validTenantData);
      await repository.create(tenant);

      const foundTenant = await repository.findByEmail(validTenantData.email);

      expect(foundTenant).toBeDefined();
      expect(foundTenant?.email).toBe(validTenantData.email);
    });

    test('should return null when tenant not found', async () => {
      const foundTenant = await repository.findByEmail('naoexiste@empresa.com');

      expect(foundTenant).toBeNull();
    });

    test('should find correct tenant among multiple tenants', async () => {
      const tenant1 = TenantEntity.create(validTenantData);
      const tenant2 = TenantEntity.create({
        ...validTenantData,
        email: 'tenant2@empresa.com',
        slug: 'tenant-2',
      });
      const tenant3 = TenantEntity.create({
        ...validTenantData,
        email: 'tenant3@empresa.com',
        slug: 'tenant-3',
      });

      await repository.create(tenant1);
      await repository.create(tenant2);
      await repository.create(tenant3);

      const foundTenant = await repository.findByEmail('tenant2@empresa.com');

      expect(foundTenant).toBeDefined();
      expect(foundTenant?.email).toBe('tenant2@empresa.com');
    });

    test('should be case sensitive for email search', async () => {
      const tenant = TenantEntity.create(validTenantData);
      await repository.create(tenant);

      const foundTenant = await repository.findByEmail('TESTE@EMPRESA.COM');

      expect(foundTenant).toBeNull();
    });

    test('should handle special characters in email', async () => {
      const specialEmailTenant = TenantEntity.create({
        ...validTenantData,
        email: 'teste+tag@empresa.com',
        slug: 'special-email',
      });

      await repository.create(specialEmailTenant);

      const foundTenant = await repository.findByEmail('teste+tag@empresa.com');

      expect(foundTenant).toBeDefined();
      expect(foundTenant?.email).toBe('teste+tag@empresa.com');
    });
  });

  describe('Repository State', () => {
    test('should start empty', async () => {
      const foundTenant = await repository.findByEmail('qualquer@email.com');
      expect(foundTenant).toBeNull();
    });

    test('should maintain state between operations', async () => {
      const tenant1 = TenantEntity.create(validTenantData);
      await repository.create(tenant1);

      const tenant2 = TenantEntity.create({
        ...validTenantData,
        email: 'segundo@empresa.com',
        slug: 'segundo',
      });
      await repository.create(tenant2);

      const found1 = await repository.findByEmail(validTenantData.email);
      const found2 = await repository.findByEmail('segundo@empresa.com');

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });

    test('should handle empty email search', async () => {
      const tenant = TenantEntity.create(validTenantData);
      await repository.create(tenant);

      const foundTenant = await repository.findByEmail('');

      expect(foundTenant).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle tenant with null optional fields', async () => {
      const minimalTenant = TenantEntity.create({
        name: 'Empresa Minima',
        email: 'minima@empresa.com',
        slug: 'minima',
        isActive: true,
        password: 'Senha#123',
      });

      const createdTenant = await repository.create(minimalTenant);

      expect(createdTenant.phone).toBeNull();
      expect(createdTenant.address).toBeNull();
    });

    test('should handle tenant with very long email', async () => {
      const longEmailTenant = TenantEntity.create({
        ...validTenantData,
        email: 'usuario.com.nome.muito.longo.para.testar@empresa.com.br',
        slug: 'long-email',
      });

      await repository.create(longEmailTenant);

      const foundTenant = await repository.findByEmail(
        'usuario.com.nome.muito.longo.para.testar@empresa.com.br'
      );

      expect(foundTenant).toBeDefined();
    });

    test('should handle inactive tenant', async () => {
      const inactiveTenant = TenantEntity.create({
        ...validTenantData,
        email: 'inactive@empresa.com',
        slug: 'inactive',
        isActive: false,
      });

      await repository.create(inactiveTenant);

      const foundTenant = await repository.findByEmail('inactive@empresa.com');

      expect(foundTenant).toBeDefined();
      expect(foundTenant?.isActive).toBe(false);
    });

    test('should handle tenant with email containing dots', async () => {
      const dottedEmailTenant = TenantEntity.create({
        ...validTenantData,
        email: 'first.last@empresa.com',
        slug: 'dotted-email',
      });

      await repository.create(dottedEmailTenant);

      const foundTenant = await repository.findByEmail('first.last@empresa.com');

      expect(foundTenant).toBeDefined();
    });

    test('should handle tenant with subdomain email', async () => {
      const subdomainTenant = TenantEntity.create({
        ...validTenantData,
        email: 'teste@mail.empresa.com.br',
        slug: 'subdomain',
      });

      await repository.create(subdomainTenant);

      const foundTenant = await repository.findByEmail('teste@mail.empresa.com.br');

      expect(foundTenant).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('should handle creating many tenants', async () => {
      const tenants = Array.from({ length: 100 }, (_, i) =>
        TenantEntity.create({
          ...validTenantData,
          email: `tenant${i}@empresa.com`,
          slug: `tenant-${i}`,
        })
      );

      for (const tenant of tenants) {
        await repository.create(tenant);
      }

      const foundTenant = await repository.findByEmail('tenant50@empresa.com');
      expect(foundTenant).toBeDefined();
    });

    test('should find tenant quickly among many', async () => {
      for (let i = 0; i < 50; i++) {
        const tenant = TenantEntity.create({
          ...validTenantData,
          email: `tenant${i}@empresa.com`,
          slug: `tenant-${i}`,
        });
        await repository.create(tenant);
      }

      const startTime = Date.now();
      await repository.findByEmail('tenant25@empresa.com');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
