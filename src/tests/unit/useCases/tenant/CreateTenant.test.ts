import { describe, expect, test } from 'vitest';
import { TenantRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateTenant } from '../../../../core/useCases/tenant/Create';

describe('Unit test CreateTenant UseCase', () => {
  const validTenant = {
    name: 'Empresa Teste',
    email: 'teste@empresa.com',
    slug: 'empresa-teste',
    phone: '11999999999',
    password: 'Senha#123',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  describe('Successful Creation', () => {
    test('should create tenant with all fields', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const createdTenant = await createTenant.execute(validTenant);

      expect(createdTenant).toBeDefined();
      expect(createdTenant.name).toBe(validTenant.name);
      expect(createdTenant.email).toBe(validTenant.email);
      expect(createdTenant.slug).toBe(validTenant.slug);
      expect(createdTenant.phone).toBe(validTenant.phone);
      expect(createdTenant.isActive).toBe(true);
      expect(createdTenant.address).toBe(validTenant.address);
      expect(createdTenant.password).toBe(validTenant.password);
    });

    test('should create tenant without optional fields', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const minimalTenant = {
        name: 'Empresa Minima',
        email: 'minima@empresa.com',
        slug: 'empresa-minima',
        password: 'Senha#123',
        isActive: true,
      };

      const createdTenant = await createTenant.execute(minimalTenant);

      expect(createdTenant).toBeDefined();
      expect(createdTenant.phone).toBeNull();
      expect(createdTenant.address).toBeNull();
    });

    test('should persist tenant in repository', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      await createTenant.execute(validTenant);

      const savedTenant = await tenantInMemory.findByEmail(validTenant.email);
      expect(savedTenant).toBeDefined();
      expect(savedTenant?.email).toBe(validTenant.email);
    });

    test('should create multiple different tenants', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const tenant1 = await createTenant.execute({
        ...validTenant,
        email: 'tenant1@empresa.com',
        slug: 'tenant-1',
      });

      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'tenant2@empresa.com',
        slug: 'tenant-2',
      });

      expect(tenant1).toBeDefined();
      expect(tenant2).toBeDefined();
      expect(tenant1.email).not.toBe(tenant2.email);
    });
  });

  describe('Email Uniqueness Validation', () => {
    test('should not allow duplicate email', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      await createTenant.execute(validTenant);

      await expect(() => createTenant.execute(validTenant)).rejects.toThrow(
        'Já existe um tenant com este email'
      );
    });

    test('should reject duplicate email even with different data', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      await createTenant.execute(validTenant);

      const duplicateEmailTenant = {
        name: 'Outra Empresa',
        email: validTenant.email, // mesmo email
        slug: 'outra-empresa',
        password: 'Senha#123',
        isActive: true,
      };

      await expect(() => createTenant.execute(duplicateEmailTenant)).rejects.toThrow(
        'Já existe um tenant com este email'
      );
    });

    test('should allow same name but different email', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      await createTenant.execute(validTenant);

      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'outro@empresa.com',
        slug: 'outro-slug',
      });

      expect(tenant2).toBeDefined();
      expect(tenant2.name).toBe(validTenant.name);
    });
  });

  describe('Entity Validation Errors', () => {
    test('should throw error for invalid name', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const invalidNameTenant = {
        ...validTenant,
        name: 'ab', // menos de 3 caracteres
      };

      await expect(() => createTenant.execute(invalidNameTenant)).rejects.toThrow(
        'Nome do tenant deve ter pelo menos 3 caracteres'
      );
    });

    test('should throw error for invalid email format', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const invalidEmailTenant = {
        ...validTenant,
        email: 'emailinvalido',
      };

      await expect(() => createTenant.execute(invalidEmailTenant)).rejects.toThrow(
        'Email inválido'
      );
    });

    test('should throw error for invalid slug', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const invalidSlugTenant = {
        ...validTenant,
        slug: 'Slug Invalido!',
      };

      await expect(() => createTenant.execute(invalidSlugTenant)).rejects.toThrow(
        'Slug inválido. Use apenas letras minúsculas, números e hífens'
      );
    });

    test('should throw error for invalid phone', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const invalidPhoneTenant = {
        ...validTenant,
        phone: '123', // telefone muito curto
      };

      await expect(() => createTenant.execute(invalidPhoneTenant)).rejects.toThrow(
        'Telefone inválido'
      );
    });

    test('should throw error for multiple invalid fields', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const multipleErrorsTenant = {
        name: 'ab',
        email: 'emailinvalido',
        slug: 'slug invalido!',
        isActive: true,
        password: 'Senha#123',
      };

      await expect(() => createTenant.execute(multipleErrorsTenant)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle tenant with very long name', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const longNameTenant = {
        ...validTenant,
        name: 'Empresa com Nome Extremamente Longo para Testar Limites do Sistema',
        email: 'longname@empresa.com',
        slug: 'empresa-long-name',
      };

      const createdTenant = await createTenant.execute(longNameTenant);
      expect(createdTenant).toBeDefined();
    });

    test('should handle tenant with special characters in name', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const specialCharTenant = {
        ...validTenant,
        name: 'Empresa & Cia Ltda.',
        email: 'special@empresa.com',
        slug: 'empresa-special',
      };

      const createdTenant = await createTenant.execute(specialCharTenant);
      expect(createdTenant).toBeDefined();
      expect(createdTenant.name).toBe('Empresa & Cia Ltda.');
    });

    test('should handle tenant with email subdomain', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const subdomainTenant = {
        ...validTenant,
        email: 'teste@mail.empresa.com.br',
        slug: 'subdomain-tenant',
      };

      const createdTenant = await createTenant.execute(subdomainTenant);
      expect(createdTenant).toBeDefined();
      expect(createdTenant.email).toBe('teste@mail.empresa.com.br');
    });

    test('should handle inactive tenant creation', async () => {
      const tenantInMemory = new TenantRepositoryInMemory();
      const createTenant = new CreateTenant(tenantInMemory);

      const inactiveTenant = {
        ...validTenant,
        email: 'inactive@empresa.com',
        slug: 'inactive-tenant',
        isActive: false,
      };

      const createdTenant = await createTenant.execute(inactiveTenant);
      expect(createdTenant).toBeDefined();
      expect(createdTenant.isActive).toBe(false);
    });
  });
});
