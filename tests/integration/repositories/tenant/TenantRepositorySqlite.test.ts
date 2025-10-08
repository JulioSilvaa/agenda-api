import { describe, expect, test, beforeEach } from 'vitest';
import crypto from 'crypto';
import { TenantRepositorySqlite } from '../../../../src/infra/repositories/sqlite/TenantRepositorySqlite';
import { TenantEntity } from '../../../../src/core/entities/TenantEntity';

process.env.SQLITE_DB_PATH = ':memory:';

describe('Integration test TenantRepositorySqlite', () => {
  let repository: TenantRepositorySqlite;

  beforeEach(() => {
    repository = new TenantRepositorySqlite();
  });

  function makeTenant(
    overrides: Partial<{
      id: string;
      name: string;
      slug: string;
      email: string;
      phone: string;
      isActive: boolean;
      address: string;
      password: string;
    }> = {}
  ) {
    return TenantEntity.create({
      id: overrides.id ?? crypto.randomUUID(),
      name: overrides.name ?? 'Tenant Test',
      slug: overrides.slug ?? 'tenant-' + Math.random().toString(16).slice(2),
      email: overrides.email ?? 'tenant' + Math.random().toString(16).slice(2) + '@example.com',
      phone: overrides.phone ?? '11988887777',
      isActive: overrides.isActive ?? true,
      address: overrides.address ?? 'Rua X',
      password: overrides.password ?? 'Abcdef1!',
    });
  }

  describe('Create', () => {
    test('should create tenant successfully', async () => {
      const tenant = makeTenant({ email: 'create.tenant@example.com' });
      const created = await repository.create(tenant);
      expect(created.id).toBe(tenant.id);
      const found = await repository.findById(tenant.id!);
      expect(found?.email).toBe('create.tenant@example.com');
    });
  });

  describe('FindByEmail', () => {
    test('should find by email', async () => {
      const tenant = makeTenant({ email: 'unique@example.com' });
      await repository.create(tenant);
      const found = await repository.findByEmail('unique@example.com');
      expect(found?.id).toBe(tenant.id);
    });

    test('should return null when email not found', async () => {
      const found = await repository.findByEmail('naoexiste@example.com');
      expect(found).toBeNull();
    });
  });

  describe('Update', () => {
    test('should update tenant', async () => {
      const tenant = await repository.create(makeTenant({ name: 'Original' }));
      const updated = TenantEntity.create({
        id: tenant.id!,
        name: 'Alterado',
        slug: tenant.slug || 'slug-x',
        email: tenant.email || 'alt@example.com',
        phone: tenant.phone || '11988887777',
        isActive: tenant.isActive,
        address: tenant.address || 'Rua X',
        password: tenant.password || 'Abcdef1!',
      });
      const result = await repository.update(updated);
      expect(result.name).toBe('Alterado');
    });

    test('should throw when updating non-existent tenant', async () => {
      const tenant = makeTenant({ id: 'nao-existe', email: 'x@example.com' });
      await expect(repository.update(tenant)).rejects.toThrow('Tenant não encontrado');
    });
  });

  describe('Delete', () => {
    test('should delete tenant', async () => {
      const tenant = await repository.create(makeTenant());
      await repository.delete(tenant.id!);
      const found = await repository.findById(tenant.id!);
      expect(found).toBeNull();
    });

    test('delete non-existent should not throw', async () => {
      await expect(repository.delete('invalido')).resolves.not.toThrow();
    });
  });

  describe('FindById', () => {
    test('should return tenant', async () => {
      const tenant = await repository.create(makeTenant());
      const found = await repository.findById(tenant.id!);
      expect(found?.id).toBe(tenant.id);
    });

    test('should return null for unknown id', async () => {
      const found = await repository.findById('desconhecido');
      expect(found).toBeNull();
    });
  });
});
