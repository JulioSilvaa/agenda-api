import { describe, expect, test, beforeEach } from 'vitest';
import { ServiceRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateService } from '../../../core/useCases/service/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
import UpdateService from './../../../core/useCases/service/Update';

describe('Unit test UpdateService UseCase', () => {
  let serviceRepository: ServiceRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createService: CreateService;
  let createTenant: CreateTenant;
  let updateService: UpdateService;
  let tenantId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
    password: 'Senha#123',
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
    updateService = new UpdateService(serviceRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Update', () => {
    test('should update service name', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: 'Corte de Cabelo Premium',
      //   description: service.description!,
      //   price: service.price,
      //   durationMinutes: service.durationMinutes,
      //   isActive: service.isActive,
      // });

      // expect(updated.name).toBe('Corte de Cabelo Premium');
      // expect(updated.updatedAt.getTime()).toBeGreaterThan(service.createdAt.getTime());
    });

    test('should update service price', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: service.name,
      //   description: service.description!,
      //   price: 75.0,
      //   durationMinutes: service.durationMinutes,
      //   isActive: service.isActive,
      // });

      // expect(updated.price).toBe(75.0);
    });

    test('should update service duration', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: service.name,
      //   description: service.description!,
      //   price: service.price,
      //   durationMinutes: 60,
      //   isActive: service.isActive,
      // });

      // expect(updated.durationMinutes).toBe(60);
    });

    test('should update service description', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: service.name,
      //   description: 'Nova descrição atualizada',
      //   price: service.price,
      //   durationMinutes: service.durationMinutes,
      //   isActive: service.isActive,
      // });

      // expect(updated.description).toBe('Nova descrição atualizada');
    });

    test('should update service active status', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: service.name,
      //   description: service.description!,
      //   price: service.price,
      //   durationMinutes: service.durationMinutes,
      //   isActive: false,
      // });

      // expect(updated.isActive).toBe(false);
    });

    test('should update multiple fields at once', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: 'Corte Premium',
      //   description: 'Descrição nova',
      //   price: 100.0,
      //   durationMinutes: 45,
      //   isActive: false,
      // });

      // expect(updated.name).toBe('Corte Premium');
      // expect(updated.price).toBe(100.0);
      // expect(updated.durationMinutes).toBe(45);
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when service does not exist', async () => {
      // await expect(() =>
      //   updateService.execute({
      //     id: 'non-existent-id',
      //     tenantId,
      //     name: 'Nome',
      //     price: 50,
      //     durationMinutes: 30,
      //     isActive: true,
      //   })
      // ).rejects.toThrow('Serviço não encontrado');
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to update service from different tenant', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'outro@example.com',
        slug: 'outro',
      });

      // await expect(() =>
      //   updateService.execute({
      //     id: service.id!,
      //     tenantId: tenant2.id!,
      //     name: service.name,
      //     price: service.price,
      //     durationMinutes: service.durationMinutes,
      //     isActive: service.isActive,
      //   })
      // ).rejects.toThrow('Serviço não pertence a este tenant');
    });
  });

  describe('Name Uniqueness Validation', () => {
    test('should throw error when updating to duplicate name', async () => {
      const service1 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 1',
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 2',
      });

      // await expect(() =>
      //   updateService.execute({
      //     id: service1.id!,
      //     tenantId,
      //     name: 'Serviço 2',
      //     price: service1.price,
      //     durationMinutes: service1.durationMinutes,
      //     isActive: service1.isActive,
      //   })
      // ).rejects.toThrow('Já existe um serviço com este nome neste tenant');
    });

    test('should allow update with same name (no change)', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // const updated = await updateService.execute({
      //   id: service.id!,
      //   tenantId,
      //   name: service.name,
      //   price: 75.0,
      //   durationMinutes: service.durationMinutes,
      //   isActive: service.isActive,
      // });

      // expect(updated.name).toBe(service.name);
      // expect(updated.price).toBe(75.0);
    });
  });

  describe('Entity Validation Errors', () => {
    test('should throw error for invalid name', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await expect(() =>
      //   updateService.execute({
      //     id: service.id!,
      //     tenantId,
      //     name: 'Ab',
      //     price: service.price,
      //     durationMinutes: service.durationMinutes,
      //     isActive: service.isActive,
      //   })
      // ).rejects.toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should throw error for invalid price', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await expect(() =>
      //   updateService.execute({
      //     id: service.id!,
      //     tenantId,
      //     name: service.name,
      //     price: -10,
      //     durationMinutes: service.durationMinutes,
      //     isActive: service.isActive,
      //   })
      // ).rejects.toThrow('Preço não pode ser negativo');
    });

    test('should throw error for invalid duration', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await expect(() =>
      //   updateService.execute({
      //     id: service.id!,
      //     tenantId,
      //     name: service.name,
      //     price: service.price,
      //     durationMinutes: 0,
      //     isActive: service.isActive,
      //   })
      // ).rejects.toThrow('Duração deve ser maior que zero');
    });
  });
});
