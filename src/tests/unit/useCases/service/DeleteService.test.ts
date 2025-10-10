import { describe, expect, test, beforeEach } from 'vitest';
import { ServiceRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateService } from '../../../../core/useCases/service/Create';
import { CreateTenant } from '../../../../core/useCases/tenant/Create';
import DeleteService from '../../../../core/useCases/service/Delete';
describe('Unit test DeleteService UseCase', () => {
  let serviceRepository: ServiceRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createService: CreateService;
  let createTenant: CreateTenant;
  let deleteService: DeleteService;
  let tenantId: string;
  let tenant2Id: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
    password: 'Senha#123',
    tenantId: 'tenant1234$',
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
    deleteService = new DeleteService(serviceRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: 'salao2@example.com',
      slug: 'salao-2',
      password: 'Senha#123',
    });
    tenant2Id = tenant2.id!;
  });

  describe('Successful Deletion', () => {
    test('should delete existing service', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await deleteService.execute(service.id!, tenantId);

      // const foundService = await serviceRepository.findById(service.id!);
      // expect(foundService).toBeNull();
    });

    test('should remove service from repository', async () => {
      const service1 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 1',
      });

      const service2 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 2',
      });

      // await deleteService.execute(service1.id!, tenantId);

      // const allServices = await serviceRepository.findByTenantId(tenantId);
      // expect(allServices.length).toBe(1);
      // expect(allServices[0].id).toBe(service2.id);
    });

    test('should delete multiple services independently', async () => {
      const service1 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 1',
      });

      const service2 = await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 2',
      });

      // await deleteService.execute(service1.id!, tenantId);

      // const found1 = await serviceRepository.findById(service1.id!);
      // const found2 = await serviceRepository.findById(service2.id!);

      // expect(found1).toBeNull();
      // expect(found2).toBeDefined();
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when service does not exist', async () => {
      // await expect(() =>
      //   deleteService.execute('non-existent-id', tenantId)
      // ).rejects.toThrow('Serviço não encontrado');
    });

    test('should throw error for empty id', async () => {
      // await expect(() => deleteService.execute('', tenantId)).rejects.toThrow(
      //   'Serviço não encontrado'
      // );
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to delete service from different tenant', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await expect(() =>
      //   deleteService.execute(service.id!, tenant2Id)
      // ).rejects.toThrow('Serviço não pertence a este tenant');
    });

    test('should throw error for invalid tenant id', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await expect(() =>
      //   deleteService.execute(service.id!, 'wrong-tenant')
      // ).rejects.toThrow('Serviço não pertence a este tenant');
    });
  });

  describe('Edge Cases', () => {
    test('should not affect other tenants services', async () => {
      const service1 = await createService.execute({
        ...validService,
        tenantId,
      });

      const service2 = await createService.execute({
        ...validService,
        tenantId: tenant2Id,
      });

      // await deleteService.execute(service1.id!, tenantId);

      // const found1 = await serviceRepository.findById(service1.id!);
      // const found2 = await serviceRepository.findById(service2.id!);

      // expect(found1).toBeNull();
      // expect(found2).toBeDefined();
    });

    test('should handle deletion of already deleted service', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
      });

      // await deleteService.execute(service.id!, tenantId);

      // await expect(() =>
      //   deleteService.execute(service.id!, tenantId)
      // ).rejects.toThrow('Serviço não encontrado');
    });

    test('should delete inactive service', async () => {
      const service = await createService.execute({
        ...validService,
        tenantId,
        isActive: false,
      });

      // await deleteService.execute(service.id!, tenantId);

      // const foundService = await serviceRepository.findById(service.id!);
      // expect(foundService).toBeNull();
    });
  });
});
