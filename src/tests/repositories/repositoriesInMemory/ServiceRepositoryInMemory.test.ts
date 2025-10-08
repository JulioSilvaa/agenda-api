import { describe, expect, test, beforeEach } from 'vitest';
import { ServiceRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory';
import { ServiceEntity } from '../../../core/entities/ServiceEntity';

describe('Unit test ServiceRepositoryInMemory', () => {
  let repository: ServiceRepositoryInMemory;
  const tenantId = 'tenant-123';
  const tenant2Id = 'tenant-456';

  beforeEach(() => {
    repository = new ServiceRepositoryInMemory();
  });

  describe('Create', () => {
    test('should create service successfully', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Corte de Cabelo',
        description: 'Corte masculino',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(service);

      expect(created).toBeDefined();
      expect(created.id).toBe(service.id);
      expect(created.name).toBe('Corte de Cabelo');
    });

    test('should create multiple services', async () => {
      const service1 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 1',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service2 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 2',
        price: 75,
        durationMinutes: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service1);
      await repository.create(service2);

      const found1 = await repository.findById(service1.id!);
      const found2 = await repository.findById(service2.id!);

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
    });
  });

  describe('Update', () => {
    test('should update service successfully', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Original',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service);

      const updated = ServiceEntity.create({
        id: service.id ?? '',
        tenantId: service.tenantId,
        name: 'Atualizado',
        description: service.description ?? undefined,
        price: service.price,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
        createdAt: service.createdAt,
        updatedAt: new Date(),
      });

      const result = await repository.update(updated);

      expect(result.name).toBe('Atualizado');
    });

    test('should throw error when updating non-existent service', async () => {
      const service = ServiceEntity.create({
        id: 'non-existent',
        tenantId,
        name: 'Teste',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(() => repository.update(service)).rejects.toThrow('Serviço não encontrado');
    });
  });

  describe('Delete', () => {
    test('should delete service successfully', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Para Deletar',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service);
      await repository.delete(service.id!);

      const found = await repository.findById(service.id!);
      expect(found).toBeNull();
    });

    test('should not throw error when deleting non-existent service', async () => {
      await expect(repository.delete('non-existent')).resolves.not.toThrow();
    });

    test('should only delete specified service', async () => {
      const service1 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 1',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service2 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 2',
        price: 75,
        durationMinutes: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service1);
      await repository.create(service2);

      await repository.delete(service1.id!);

      const found1 = await repository.findById(service1.id!);
      const found2 = await repository.findById(service2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });
  });

  describe('FindById', () => {
    test('should find service by id', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Teste',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service);
      const found = await repository.findById(service.id!);

      expect(found).toBeDefined();
      expect(found?.id).toBe(service.id);
      expect(found?.name).toBe('Teste');
    });

    test('should return null when service not found', async () => {
      const found = await repository.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('FindByTenantId', () => {
    test('should find all services for a tenant', async () => {
      const service1 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 1',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service2 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 2',
        price: 75,
        durationMinutes: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service1);
      await repository.create(service2);

      const services = await repository.findByTenantId(tenantId);

      expect(services).toHaveLength(2);
      expect(services[0].tenantId).toBe(tenantId);
      expect(services[1].tenantId).toBe(tenantId);
    });

    test('should return empty array when tenant has no services', async () => {
      const services = await repository.findByTenantId('empty-tenant');
      expect(services).toHaveLength(0);
      expect(Array.isArray(services)).toBe(true);
    });

    test('should isolate services by tenant', async () => {
      const service1 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Tenant 1 Service',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service2 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        name: 'Tenant 2 Service',
        price: 75,
        durationMinutes: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service1);
      await repository.create(service2);

      const tenant1Services = await repository.findByTenantId(tenantId);
      const tenant2Services = await repository.findByTenantId(tenant2Id);

      expect(tenant1Services).toHaveLength(1);
      expect(tenant2Services).toHaveLength(1);
      expect(tenant1Services[0].name).toBe('Tenant 1 Service');
      expect(tenant2Services[0].name).toBe('Tenant 2 Service');
    });
  });

  describe('FindByName', () => {
    test('should find service by name and tenantId', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Corte Especial',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service);
      const found = await repository.findByName('Corte Especial', tenantId);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Corte Especial');
      expect(found?.tenantId).toBe(tenantId);
    });

    test('should return null when service name not found', async () => {
      const found = await repository.findByName('Non-existent', tenantId);
      expect(found).toBeNull();
    });

    test('should isolate name search by tenant', async () => {
      const service1 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Corte Premium',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service2 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId: tenant2Id,
        name: 'Corte Premium',
        price: 75,
        durationMinutes: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service1);
      await repository.create(service2);

      const foundTenant1 = await repository.findByName('Corte Premium', tenantId);
      const foundTenant2 = await repository.findByName('Corte Premium', tenant2Id);

      expect(foundTenant1).toBeDefined();
      expect(foundTenant2).toBeDefined();
      expect(foundTenant1?.id).toBe(service1.id);
      expect(foundTenant2?.id).toBe(service2.id);
    });

    test('should be case-sensitive', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Corte de Cabelo',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service);

      const foundExact = await repository.findByName('Corte de Cabelo', tenantId);
      const foundDifferentCase = await repository.findByName('corte de cabelo', tenantId);

      expect(foundExact).toBeDefined();
      expect(foundDifferentCase).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle service with null description', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço',
        description: undefined,
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await repository.create(service);
      const found = await repository.findById(created.id!);

      expect(found?.description).toBeNull();
    });

    test('should handle inactive services', async () => {
      const service = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço Inativo',
        price: 50,
        durationMinutes: 30,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service);
      const found = await repository.findById(service.id!);

      expect(found?.isActive).toBe(false);
    });

    test('should maintain service list after multiple operations', async () => {
      const service1 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 1',
        price: 50,
        durationMinutes: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service2 = ServiceEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Serviço 2',
        price: 75,
        durationMinutes: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(service1);
      await repository.create(service2);
      await repository.delete(service1.id!);

      const services = await repository.findByTenantId(tenantId);
      expect(services).toHaveLength(1);
      expect(services[0].id).toBe(service2.id);
    });
  });
});
