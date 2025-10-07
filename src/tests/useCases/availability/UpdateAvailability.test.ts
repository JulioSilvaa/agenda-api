import { describe, expect, test, beforeEach } from 'vitest';
import { AvailabilityRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/AvailabilityRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateAvailability } from '../../../core/useCases/availability/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
import UpdateAvailability from '../../../core/useCases/availability/Update';
describe('Unit test UpdateAvailability UseCase', () => {
  let availabilityRepository: AvailabilityRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createAvailability: CreateAvailability;
  let createTenant: CreateTenant;
  let updateAvailability: UpdateAvailability;
  let tenantId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    password: 'Senha#123',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  const validAvailability = {
    weekday: 1,
    startTime: '09:00',
    endTime: '12:00',
    isActive: true,
    createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    availabilityRepository = new AvailabilityRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createAvailability = new CreateAvailability(availabilityRepository, tenantRepository);
    updateAvailability = new UpdateAvailability(availabilityRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Update', () => {
    test('should update availability weekday', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const updated = await updateAvailability.execute({
        id: availability.id!,
        tenantId,
        weekday: 2,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isActive: availability.isActive,
      });

      expect(updated.weekday).toBe(2);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(availability.createdAt.getTime());
    });

    test('should update availability start time', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const updated = await updateAvailability.execute({
        id: availability.id!,
        tenantId,
        weekday: availability.weekday,
        startTime: '10:00',
        endTime: availability.endTime,
        isActive: availability.isActive,
      });

      expect(updated.startTime).toBe('10:00');
    });

    test('should update availability end time', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const updated = await updateAvailability.execute({
        id: availability.id!,
        tenantId,
        weekday: availability.weekday,
        startTime: availability.startTime,
        endTime: '18:00',
        isActive: availability.isActive,
      });

      expect(updated.endTime).toBe('18:00');
    });

    test('should update availability active status', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const updated = await updateAvailability.execute({
        id: availability.id!,
        tenantId,
        weekday: availability.weekday,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isActive: false,
      });

      expect(updated.isActive).toBe(false);
    });

    test('should update multiple fields at once', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const updated = await updateAvailability.execute({
        id: availability.id!,
        tenantId,
        weekday: 3,
        startTime: '14:00',
        endTime: '18:00',
        isActive: false,
      });

      expect(updated.weekday).toBe(3);
      expect(updated.startTime).toBe('14:00');
      expect(updated.endTime).toBe('18:00');
      expect(updated.isActive).toBe(false);
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when availability does not exist', async () => {
      await expect(() =>
        updateAvailability.execute({
          id: 'non-existent-id',
          tenantId,
          weekday: 1,
          startTime: '09:00',
          endTime: '12:00',
          isActive: true,
        })
      ).rejects.toThrow('Disponibilidade não encontrada');
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to update availability from different tenant', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'outro@example.com',
        slug: 'outro',
      });

      await expect(() =>
        updateAvailability.execute({
          id: availability.id!,
          tenantId: tenant2.id!,
          weekday: availability.weekday,
          startTime: availability.startTime,
          endTime: availability.endTime,
          isActive: availability.isActive,
        })
      ).rejects.toThrow('Disponibilidade não pertence a este tenant');
    });
  });

  describe('Time Conflict Validation', () => {
    test('should throw error when updating to conflicting time slot', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const availability1 = await createAvailability.execute({
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

      await expect(() =>
        updateAvailability.execute({
          id: availability1.id!,
          tenantId,
          weekday: 1,
          startTime: '15:00',
          endTime: '17:00',
        })
      ).rejects.toThrow('Já existe disponibilidade neste horário para este dia da semana');
    });

    test('should allow update with same time (no change)', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      const updated = await updateAvailability.execute({
        id: availability.id!,
        tenantId,
        weekday: availability.weekday,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isActive: false,
      });

      expect(updated.startTime).toBe(availability.startTime);
      expect(updated.isActive).toBe(false);
    });
  });

  describe('Entity Validation Errors', () => {
    test('should throw error for invalid weekday', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await expect(() =>
        updateAvailability.execute({
          id: availability.id!,
          tenantId,
          weekday: 7,
          startTime: availability.startTime,
          endTime: availability.endTime,
          isActive: availability.isActive,
        })
      ).rejects.toThrow('Dia da semana inválido');
    });

    test('should throw error for invalid time format', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await expect(() =>
        updateAvailability.execute({
          id: availability.id!,
          tenantId,
          weekday: availability.weekday,
          startTime: '25:00',
          endTime: availability.endTime,
          isActive: availability.isActive,
        })
      ).rejects.toThrow('Horário de início inválido');
    });

    test('should throw error when endTime is before startTime', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
      });

      await expect(() =>
        updateAvailability.execute({
          id: availability.id!,
          tenantId,
          weekday: availability.weekday,
          startTime: '12:00',
          endTime: '09:00',
          isActive: availability.isActive,
        })
      ).rejects.toThrow('Horário de término deve ser posterior ao horário de início');
    });
  });
});
