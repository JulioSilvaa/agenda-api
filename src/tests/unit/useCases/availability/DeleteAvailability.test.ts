import { describe, expect, test, beforeEach } from 'vitest';
import { AvailabilityRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/AvailabilityRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateAvailability } from '../../../../core/useCases/availability/Create';
import { CreateTenant } from '../../../../core/useCases/tenant/Create';
import DeleteAvailability from '../../../../core/useCases/availability/Delete';

describe('Unit test DeleteAvailability UseCase', () => {
  let availabilityRepository: AvailabilityRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createAvailability: CreateAvailability;
  let createTenant: CreateTenant;
  let deleteAvailability: DeleteAvailability;
  let tenantId: string;
  let tenant2Id: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    password: 'Senha123#',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  const validAvailability = {
    weekday: 1,
    startTime: '09:00',
    endTime: '12:00',
    isActive: true,
  };

  beforeEach(async () => {
    availabilityRepository = new AvailabilityRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createAvailability = new CreateAvailability(availabilityRepository, tenantRepository);
    deleteAvailability = new DeleteAvailability(availabilityRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: 'salao2@example.com',
      slug: 'salao-2',
    });
    tenant2Id = tenant2.id!;
  });

  describe('Successful Deletion', () => {
    test('should delete existing availability', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await deleteAvailability.execute(availability.id!, tenantId);

      const foundAvailability = await availabilityRepository.findById(availability.id!);
      expect(foundAvailability).toBeNull();
    });

    test('should remove availability from repository', async () => {
      const availability1 = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      const availability2 = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
      });

      await deleteAvailability.execute(availability1.id!, tenantId);

      const allAvailabilities = await availabilityRepository.findByTenantId(tenantId);
      expect(allAvailabilities.length).toBe(1);
      expect(allAvailabilities[0].id).toBe(availability2.id);
    });

    test('should delete multiple availabilities independently', async () => {
      const availability1 = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      const availability2 = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
      });

      await deleteAvailability.execute(availability1.id!, tenantId);

      const found1 = await availabilityRepository.findById(availability1.id!);
      const found2 = await availabilityRepository.findById(availability2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when availability does not exist', async () => {
      await expect(() => deleteAvailability.execute('non-existent-id', tenantId)).rejects.toThrow(
        'Disponibilidade não encontrada'
      );
    });

    test('should throw error for empty id', async () => {
      await expect(() => deleteAvailability.execute('', tenantId)).rejects.toThrow(
        'Disponibilidade não encontrada'
      );
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to delete availability from different tenant', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await expect(() => deleteAvailability.execute(availability.id!, tenant2Id)).rejects.toThrow(
        'Disponibilidade não pertence a este tenant'
      );
    });

    test('should throw error for invalid tenant id', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await expect(() =>
        deleteAvailability.execute(availability.id!, 'wrong-tenant')
      ).rejects.toThrow('Disponibilidade não pertence a este tenant');
    });
  });

  describe('Edge Cases', () => {
    test('should not affect other tenants availabilities', async () => {
      const availability1 = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const availability2 = await createAvailability.execute({
        ...validAvailability,
        tenantId: tenant2Id,
      });

      await deleteAvailability.execute(availability1.id!, tenantId);

      const found1 = await availabilityRepository.findById(availability1.id!);
      const found2 = await availabilityRepository.findById(availability2.id!);

      expect(found1).toBeNull();
      expect(found2).toBeDefined();
    });

    test('should handle deletion of already deleted availability', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await deleteAvailability.execute(availability.id!, tenantId);

      await expect(() => deleteAvailability.execute(availability.id!, tenantId)).rejects.toThrow(
        'Disponibilidade não encontrada'
      );
    });

    test('should delete inactive availability', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        isActive: false,
      });

      await deleteAvailability.execute(availability.id!, tenantId);

      const foundAvailability = await availabilityRepository.findById(availability.id!);
      expect(foundAvailability).toBeNull();
    });

    test('should allow creating availability in same time slot after deletion', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      await deleteAvailability.execute(availability.id!, tenantId);

      const newAvailability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      expect(newAvailability).toBeDefined();
      expect(newAvailability.id).not.toBe(availability.id);
    });
  });
});
