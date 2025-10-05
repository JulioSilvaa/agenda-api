import { describe, expect, test, beforeEach } from 'vitest';
import { AvailabilityRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/AvailabilityRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateAvailability } from '../../../core/useCases/availability/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';

describe('Unit test CreateAvailability UseCase', () => {
  let availabilityRepository: AvailabilityRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createAvailability: CreateAvailability;
  let createTenant: CreateTenant;
  let tenantId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  const validAvailability = {
    weekday: 1, // Segunda-feira
    startTime: '09:00',
    endTime: '12:00',
    isActive: true,
  };

  beforeEach(async () => {
    availabilityRepository = new AvailabilityRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createAvailability = new CreateAvailability(availabilityRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Creation', () => {
    test('should create availability with all fields', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
      };

      const createdAvailability = await createAvailability.execute(availabilityData);

      expect(createdAvailability).toBeDefined();
      expect(createdAvailability.id).toBeDefined();
      expect(createdAvailability.tenantId).toBe(tenantId);
      expect(createdAvailability.weekday).toBe(1);
      expect(createdAvailability.startTime).toBe('09:00');
      expect(createdAvailability.endTime).toBe('12:00');
      expect(createdAvailability.isActive).toBe(true);
      expect(createdAvailability.createdAt).toBeInstanceOf(Date);
      expect(createdAvailability.updatedAt).toBeInstanceOf(Date);
    });

    test('should create inactive availability', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        isActive: false,
      };

      const createdAvailability = await createAvailability.execute(availabilityData);

      expect(createdAvailability).toBeDefined();
      expect(createdAvailability.isActive).toBe(false);
    });

    test('should create multiple availabilities for different weekdays', async () => {
      const monday = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
      });

      const tuesday = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
      });

      expect(monday).toBeDefined();
      expect(tuesday).toBeDefined();
      expect(monday.weekday).toBe(1);
      expect(tuesday.weekday).toBe(2);
    });

    test('should create multiple availabilities for same weekday but different times', async () => {
      const morning = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      const afternoon = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '14:00',
        endTime: '18:00',
      });

      expect(morning).toBeDefined();
      expect(afternoon).toBeDefined();
      expect(morning.startTime).toBe('09:00');
      expect(afternoon.startTime).toBe('14:00');
    });

    test('should persist availability in repository', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
      };

      const createdAvailability = await createAvailability.execute(availabilityData);
      const foundAvailability = await availabilityRepository.findById(createdAvailability.id!);

      expect(foundAvailability).toBeDefined();
      expect(foundAvailability?.id).toBe(createdAvailability.id);
    });

    test('should create availability for all weekdays', async () => {
      for (let weekday = 0; weekday <= 6; weekday++) {
        const availability = await createAvailability.execute({
          ...validAvailability,
          tenantId,
          weekday,
        });

        expect(availability.weekday).toBe(weekday);
      }
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error if tenant does not exist', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId: 'invalid-tenant',
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Tenant não encontrado'
      );
    });

    test('should throw error for empty tenant id', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId: '',
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow();
    });
  });

  describe('Time Conflict Validation', () => {
    test('should not allow overlapping availability on same weekday', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      await expect(() =>
        createAvailability.execute({
          ...validAvailability,
          tenantId,
          weekday: 1,
          startTime: '10:00',
          endTime: '13:00',
        })
      ).rejects.toThrow('Já existe disponibilidade neste horário para este dia da semana');
    });

    test('should not allow availability that starts before existing one ends', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      await expect(() =>
        createAvailability.execute({
          ...validAvailability,
          tenantId,
          weekday: 1,
          startTime: '11:00',
          endTime: '14:00',
        })
      ).rejects.toThrow('Já existe disponibilidade neste horário para este dia da semana');
    });

    test('should not allow availability that ends after existing one starts', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '10:00',
        endTime: '12:00',
      });

      await expect(() =>
        createAvailability.execute({
          ...validAvailability,
          tenantId,
          weekday: 1,
          startTime: '08:00',
          endTime: '11:00',
        })
      ).rejects.toThrow('Já existe disponibilidade neste horário para este dia da semana');
    });

    test('should not allow availability completely inside existing one', async () => {
      await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '18:00',
      });

      await expect(() =>
        createAvailability.execute({
          ...validAvailability,
          tenantId,
          weekday: 1,
          startTime: '12:00',
          endTime: '14:00',
        })
      ).rejects.toThrow('Já existe disponibilidade neste horário para este dia da semana');
    });

    test('should allow availability on different weekdays at same time', async () => {
      const monday = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      const tuesday = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 2,
        startTime: '09:00',
        endTime: '12:00',
      });

      expect(monday).toBeDefined();
      expect(tuesday).toBeDefined();
    });

    test('should allow consecutive time slots', async () => {
      const morning = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      const afternoon = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '12:00',
        endTime: '15:00',
      });

      expect(morning).toBeDefined();
      expect(afternoon).toBeDefined();
    });
  });

  describe('Entity Validation Errors - Weekday', () => {
    test('should throw error for invalid weekday below 0', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        weekday: -1,
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Dia da semana inválido'
      );
    });

    test('should throw error for invalid weekday above 6', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        weekday: 7,
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Dia da semana inválido'
      );
    });
  });

  describe('Entity Validation Errors - Time Format', () => {
    test('should throw error for invalid startTime format', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        startTime: '25:00',
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Horário de início inválido'
      );
    });

    test('should throw error for invalid endTime format', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        endTime: '24:60',
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Horário de término inválido'
      );
    });

    test('should throw error when endTime is before startTime', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        startTime: '12:00',
        endTime: '09:00',
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Horário de término deve ser posterior ao horário de início'
      );
    });

    test('should throw error when startTime equals endTime', async () => {
      const availabilityData = {
        ...validAvailability,
        tenantId,
        startTime: '09:00',
        endTime: '09:00',
      };

      await expect(() => createAvailability.execute(availabilityData)).rejects.toThrow(
        'Horário de término deve ser posterior ao horário de início'
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle availability for Sunday (0)', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 0,
      });

      expect(availability).toBeDefined();
      expect(availability.weekday).toBe(0);
    });

    test('should handle availability for Saturday (6)', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 6,
      });

      expect(availability).toBeDefined();
      expect(availability.weekday).toBe(6);
    });

    test('should handle early morning availability', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        startTime: '06:00',
        endTime: '09:00',
      });

      expect(availability).toBeDefined();
      expect(availability.startTime).toBe('06:00');
    });

    test('should handle late evening availability', async () => {
      const availability = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        startTime: '18:00',
        endTime: '23:59',
      });

      expect(availability).toBeDefined();
      expect(availability.endTime).toBe('23:59');
    });

    test('should allow same tenant to have different availabilities', async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'salao2@example.com',
        slug: 'salao-2',
      });

      const availability1 = await createAvailability.execute({
        ...validAvailability,
        tenantId,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      const availability2 = await createAvailability.execute({
        ...validAvailability,
        tenantId: tenant2.id!,
        weekday: 1,
        startTime: '09:00',
        endTime: '12:00',
      });

      expect(availability1).toBeDefined();
      expect(availability2).toBeDefined();
      expect(availability1.tenantId).not.toBe(availability2.tenantId);
    });
  });
});
