import { describe, expect, test, beforeEach } from 'vitest';
import { AvailabilityRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/AvailabilityRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateAvailability } from '../../../core/useCases/availability/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
// import { ListAvailabilities } from '../../../core/useCases/availability/List'; // TODO: Implementar

describe.skip('Unit test ListAvailabilities UseCase', () => {
  let availabilityRepository: AvailabilityRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createAvailability: CreateAvailability;
  let createTenant: CreateTenant;
  // let listAvailabilities: ListAvailabilities; // TODO: Implementar
  let tenantId: string;
  let tenant2Id: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
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
    // listAvailabilities = new ListAvailabilities(availabilityRepository); // TODO: Implementar
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

  describe('Successful Listing', () => {
    test('should list all availabilities for a tenant', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
        startTime: '14:00',
        endTime: '18:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 3,
        startTime: '10:00',
        endTime: '16:00',
      });

      // const availabilities = await listAvailabilities.execute(tenantId);

      // expect(availabilities).toHaveLength(3);
    });

    test('should return empty array when tenant has no availabilities', async () => {
      // const availabilities = await listAvailabilities.execute(tenantId);

      // expect(availabilities).toHaveLength(0);
      // expect(Array.isArray(availabilities)).toBe(true);
    });

    test('should list only active availabilities', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        isActive: true,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
        isActive: false,
      });

      // const availabilities = await listAvailabilities.execute(tenantId, { onlyActive: true });

      // expect(availabilities).toHaveLength(1);
      // expect(availabilities[0].weekday).toBe(1);
      // expect(availabilities[0].isActive).toBe(true);
    });

    test('should list all availabilities including inactive ones', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        isActive: true,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
        isActive: false,
      });

      // const availabilities = await listAvailabilities.execute(tenantId);

      // expect(availabilities).toHaveLength(2);
    });
  });

  describe('Tenant Isolation', () => {
    test('should not list availabilities from other tenants', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId: tenant2Id,
        weekday: 2,
      });

      // const availabilities = await listAvailabilities.execute(tenantId);

      // expect(availabilities).toHaveLength(1);
      // expect(availabilities[0].tenantId).toBe(tenantId);
      // expect(availabilities[0].weekday).toBe(1);
    });

    test('should return independent lists for different tenants', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId: tenant2Id,
        weekday: 2,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId: tenant2Id,
        weekday: 3,
      });

      // const tenant1Availabilities = await listAvailabilities.execute(tenantId);
      // const tenant2Availabilities = await listAvailabilities.execute(tenant2Id);

      // expect(tenant1Availabilities).toHaveLength(1);
      // expect(tenant2Availabilities).toHaveLength(2);
    });
  });

  describe('Filtering by Weekday', () => {
    test('should list availabilities for specific weekday', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '14:00',
        endTime: '18:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
      });

      // const mondayAvailabilities = await listAvailabilities.execute(tenantId, { weekday: 1 });

      // expect(mondayAvailabilities).toHaveLength(2);
      // expect(mondayAvailabilities[0].weekday).toBe(1);
      // expect(mondayAvailabilities[1].weekday).toBe(1);
    });

    test('should return empty array when no availabilities for weekday', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      // const availabilities = await listAvailabilities.execute(tenantId, { weekday: 5 });

      // expect(availabilities).toHaveLength(0);
    });
  });

  describe('Sorting and Ordering', () => {
    test('should list availabilities ordered by weekday', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 5,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 3,
      });

      // const availabilities = await listAvailabilities.execute(tenantId, { sortBy: 'weekday' });

      // expect(availabilities[0].weekday).toBe(1);
      // expect(availabilities[1].weekday).toBe(3);
      // expect(availabilities[2].weekday).toBe(5);
    });

    test('should list availabilities ordered by start time', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '14:00',
        endTime: '18:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
        startTime: '09:00',
        endTime: '12:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 3,
        startTime: '10:00',
        endTime: '13:00',
      });

      // const availabilities = await listAvailabilities.execute(tenantId, { sortBy: 'startTime' });

      // expect(availabilities[0].startTime).toBe('09:00');
      // expect(availabilities[1].startTime).toBe('10:00');
      // expect(availabilities[2].startTime).toBe('14:00');
    });
  });

  describe('Edge Cases', () => {
    test('should handle all weekdays (0-6)', async () => {
      for (let weekday = 0; weekday <= 6; weekday++) {
        await createAvailability.execute({
          ...validAvailability,
          tenantId,
          weekday,
        });
      }

      // const availabilities = await listAvailabilities.execute(tenantId);

      // expect(availabilities).toHaveLength(7);
    });

    test('should preserve all availability properties', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
        isActive: true,
      });

      // const availabilities = await listAvailabilities.execute(tenantId);

      // expect(availabilities[0].weekday).toBe(1);
      // expect(availabilities[0].startTime).toBe('09:00');
      // expect(availabilities[0].endTime).toBe('12:00');
      // expect(availabilities[0].isActive).toBe(true);
      // expect(availabilities[0].createdAt).toBeInstanceOf(Date);
      // expect(availabilities[0].updatedAt).toBeInstanceOf(Date);
    });

    test('should handle multiple availabilities for same weekday', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '14:00',
        endTime: '18:00',
      });

      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '19:00',
        endTime: '21:00',
      });

      // const availabilities = await listAvailabilities.execute(tenantId, { weekday: 1 });

      // expect(availabilities).toHaveLength(3);
    });
  });
});
