import { describe, expect, test, beforeEach } from 'vitest';
import { ServiceRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateService } from '../../../core/useCases/service/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
// import { ListServices } from '../../../core/useCases/service/List'; // TODO: Implementar

describe.skip('Unit test ListServices UseCase', () => {
  let serviceRepository: ServiceRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createService: CreateService;
  let createTenant: CreateTenant;
  // let listServices: ListServices; // TODO: Implementar
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
    // listServices = new ListServices(serviceRepository); // TODO: Implementar
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
    test('should list all services for a tenant', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Corte de Cabelo',
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Barba',
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Manicure',
      });

      // const services = await listServices.execute(tenantId);

      // expect(services).toHaveLength(3);
      // expect(services[0].name).toBe('Corte de Cabelo');
      // expect(services[1].name).toBe('Barba');
      // expect(services[2].name).toBe('Manicure');
    });

    test('should return empty array when tenant has no services', async () => {
      // const services = await listServices.execute(tenantId);

      // expect(services).toHaveLength(0);
      // expect(Array.isArray(services)).toBe(true);
    });

    test('should list only active services', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço Ativo',
        isActive: true,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço Inativo',
        isActive: false,
      });

      // const services = await listServices.execute(tenantId, { onlyActive: true });

      // expect(services).toHaveLength(1);
      // expect(services[0].name).toBe('Serviço Ativo');
      // expect(services[0].isActive).toBe(true);
    });

    test('should list all services including inactive ones', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço Ativo',
        isActive: true,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço Inativo',
        isActive: false,
      });

      // const services = await listServices.execute(tenantId);

      // expect(services).toHaveLength(2);
    });
  });

  describe('Tenant Isolation', () => {
    test('should not list services from other tenants', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço Tenant 1',
      });

      await createService.execute({
        ...validService,
        tenantId: tenant2Id,
        name: 'Serviço Tenant 2',
      });

      // const services = await listServices.execute(tenantId);

      // expect(services).toHaveLength(1);
      // expect(services[0].tenantId).toBe(tenantId);
      // expect(services[0].name).toBe('Serviço Tenant 1');
    });

    test('should return independent lists for different tenants', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Corte',
      });

      await createService.execute({
        ...validService,
        tenantId: tenant2Id,
        name: 'Barba',
      });

      await createService.execute({
        ...validService,
        tenantId: tenant2Id,
        name: 'Manicure',
      });

      // const tenant1Services = await listServices.execute(tenantId);
      // const tenant2Services = await listServices.execute(tenant2Id);

      // expect(tenant1Services).toHaveLength(1);
      // expect(tenant2Services).toHaveLength(2);
    });
  });

  describe('Sorting and Ordering', () => {
    test('should list services ordered by name', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Zebra',
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Alpha',
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Bravo',
      });

      // const services = await listServices.execute(tenantId, { sortBy: 'name' });

      // expect(services[0].name).toBe('Alpha');
      // expect(services[1].name).toBe('Bravo');
      // expect(services[2].name).toBe('Zebra');
    });

    test('should list services ordered by price', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 1',
        price: 100,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 2',
        price: 50,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: 'Serviço 3',
        price: 75,
      });

      // const services = await listServices.execute(tenantId, { sortBy: 'price' });

      // expect(services[0].price).toBe(50);
      // expect(services[1].price).toBe(75);
      // expect(services[2].price).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle large number of services', async () => {
      for (let i = 0; i < 20; i++) {
        await createService.execute({
          ...validService,
          tenantId,
          name: `Serviço ${i}`,
        });
      }

      // const services = await listServices.execute(tenantId);

      // expect(services).toHaveLength(20);
    });

    test('should preserve all service properties', async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: 'Corte Premium',
        description: 'Descrição detalhada',
        price: 99.99,
        durationMinutes: 60,
        isActive: true,
      });

      // const services = await listServices.execute(tenantId);

      // expect(services[0].name).toBe('Corte Premium');
      // expect(services[0].description).toBe('Descrição detalhada');
      // expect(services[0].price).toBe(99.99);
      // expect(services[0].durationMinutes).toBe(60);
      // expect(services[0].isActive).toBe(true);
      // expect(services[0].createdAt).toBeInstanceOf(Date);
      // expect(services[0].updatedAt).toBeInstanceOf(Date);
    });

    test('should handle services with null description', async () => {
      await createService.execute({
        tenantId,
        name: 'Serviço sem descrição',
        price: 50,
        durationMinutes: 30,
        isActive: true,
      });

      // const services = await listServices.execute(tenantId);

      // expect(services[0].description).toBeNull();
    });
  });
});
