import { describe, expect, test, beforeEach } from 'vitest';
import { ServiceRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateService } from '../../../core/useCases/service/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';

describe('Unit test CreateService UseCase', () => {
  let serviceRepository: ServiceRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createService: CreateService;
  let createTenant: CreateTenant;
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

  const validService = {
    name: 'Corte de Cabelo',
    description: 'Corte masculino ou feminino',
    price: 50.0,
    durationMinutes: 30,
    isActive: true,
  };

  beforeEach(async () => {
    serviceRepository = new ServiceRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createService = new CreateService(serviceRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Creation', () => {
    test('should create service with all fields', async () => {
      const serviceData = {
        ...validService,
        tenantId,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.id).toBeDefined();
      expect(createdService.tenantId).toBe(tenantId);
      expect(createdService.name).toBe(validService.name);
      expect(createdService.description).toBe(validService.description);
      expect(createdService.price).toBe(50.0);
      expect(createdService.durationMinutes).toBe(30);
      expect(createdService.isActive).toBe(true);
      expect(createdService.createdAt).toBeInstanceOf(Date);
      expect(createdService.updatedAt).toBeInstanceOf(Date);
    });

    test('should create service without description', async () => {
      const serviceData = {
        tenantId,
        name: 'Manicure',
        price: 30.0,
        durationMinutes: 45,
        isActive: true,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.description).toBeNull();
    });

    test('should create inactive service', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Serviço Inativo',
        isActive: false,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.isActive).toBe(false);
    });

    test('should create multiple services', async () => {
      const service1 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Corte de Cabelo',
      });

      const service2 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Barba',
      });

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service1.id).not.toBe(service2.id);
    });

    test('should persist service in repository', async () => {
      const serviceData = {
        ...validService,
        tenantId,
      };

      const createdService = await createService.execute(serviceData);
      const foundService = await serviceRepository.findById(createdService.id!);

      expect(foundService).toBeDefined();
      expect(foundService?.id).toBe(createdService.id);
    });

    test('should create service with decimal price', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        price: 45.99,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.price).toBe(45.99);
    });

    test('should create service with long duration', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Tratamento Completo',
        durationMinutes: 180,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.durationMinutes).toBe(180);
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error if tenant does not exist', async () => {
      const serviceData = {
        ...validService,
        tenantId: 'invalid-tenant',
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Tenant não encontrado'
      );
    });

    test('should throw error for empty tenant id', async () => {
      const serviceData = {
        ...validService,
        tenantId: '',
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow();
    });
  });

  describe('Name Uniqueness Validation', () => {
    test('should not allow duplicate service name in same tenant', async () => {
      const serviceData = {
        ...validService,
        tenantId,
      };

      await createService.execute(serviceData);

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Já existe um serviço com este nome neste tenant'
      );
    });

    test('should allow same name in different tenants', async () => {
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'salao2@example.com',
        slug: 'salao-2',
      });

      const service1 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Corte de Cabelo',
      });

      const service2 = await createService.execute({
        ...validService,
        tenantId: tenant2.id!,
        name: 'Corte de Cabelo',
      });

      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service1.tenantId).not.toBe(service2.tenantId);
    });
  });

  describe('Entity Validation Errors - Name', () => {
    test('should throw error for empty name', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: '',
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Nome é obrigatório'
      );
    });

    test('should throw error for name with only spaces', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: '   ',
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Nome é obrigatório'
      );
    });

    test('should throw error for name less than 3 characters', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Ab',
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    test('should throw error for name longer than 100 characters', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'a'.repeat(101),
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Nome não pode ter mais de 100 caracteres'
      );
    });
  });

  describe('Entity Validation Errors - Price', () => {
    test('should throw error for negative price', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        price: -10,
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Preço não pode ser negativo'
      );
    });

    test('should throw error for zero price', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        price: 0,
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Preço deve ser maior que zero'
      );
    });
  });

  describe('Entity Validation Errors - Duration', () => {
    test('should throw error for zero duration', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        durationMinutes: 0,
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Duração deve ser maior que zero'
      );
    });

    test('should throw error for negative duration', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        durationMinutes: -30,
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Duração deve ser maior que zero'
      );
    });

    test('should throw error for duration greater than 24 hours', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        durationMinutes: 1441,
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Duração não pode ser maior que 24 horas (1440 minutos)'
      );
    });
  });

  describe('Entity Validation Errors - Description', () => {
    test('should throw error for description longer than 500 characters', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        description: 'a'.repeat(501),
      };

      await expect(() => createService.execute(serviceData)).rejects.toThrow(
        'Descrição não pode ter mais de 500 caracteres'
      );
    });

    test('should accept description with exactly 500 characters', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Serviço com descrição longa',
        description: 'a'.repeat(500),
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.description?.length).toBe(500);
    });
  });

  describe('Edge Cases', () => {
    test('should handle name with exactly 3 characters', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Spa',
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.name).toBe('Spa');
    });

    test('should handle name with exactly 100 characters', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'a'.repeat(100),
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.name.length).toBe(100);
    });

    test('should handle duration of exactly 24 hours', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Serviço 24h',
        durationMinutes: 1440,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.durationMinutes).toBe(1440);
    });

    test('should handle very high price', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Serviço Premium',
        price: 9999.99,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.price).toBe(9999.99);
    });

    test('should handle minimal price', async () => {
      const serviceData = {
        ...validService,
        tenantId,
        name: 'Serviço Barato',
        price: 0.01,
      };

      const createdService = await createService.execute(serviceData);

      expect(createdService).toBeDefined();
      expect(createdService.price).toBe(0.01);
    });
  });
});
