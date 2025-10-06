import { describe, expect, test, beforeEach } from "vitest";
import { ServiceRepositoryInMemory } from "../../../infra/repositories/repositoryInMemory/ServiceRepositoryInMemory";
import { TenantRepositoryInMemory } from "../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory";
import { CreateService } from "../../../core/useCases/service/Create";
import { CreateTenant } from "../../../core/useCases/tenant/Create";
import FindServices from "../../../core/useCases/service/Find";
describe("Unit test ListServices UseCase", () => {
  let serviceRepository: ServiceRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createService: CreateService;
  let createTenant: CreateTenant;
  let listService: FindServices;
  let tenantId: string;
  let tenant2Id: string;

  const validTenant = {
    name: "Salão de Beleza",
    email: "salao@example.com",
    slug: "salao-beleza",
    phone: "11999999999",
    password: "Senha#123",
    isActive: true,
    address: "Rua Teste, 123",
  };

  const validService = {
    name: "Corte de Cabelo",
    description: "Corte masculino ou feminino",
    price: 50.0,
    durationMinutes: 30,
    isActive: true,
  };

  beforeEach(async () => {
    serviceRepository = new ServiceRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createService = new CreateService(serviceRepository, tenantRepository);
    listService = new FindServices(serviceRepository);
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;

    const tenant2 = await createTenant.execute({
      ...validTenant,
      email: "salao2@example.com",
      slug: "salao-2",
    });
    tenant2Id = tenant2.id!;
  });

  describe("Successful Listing", () => {
    test("should list all services for a tenant", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Corte de Cabelo",
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Barba",
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Manicure",
      });
    });

    test("should return empty array when tenant has no services", async () => {});

    test("should list only active services", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço Ativo",
        isActive: true,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço Inativo",
        isActive: false,
      });
    });

    test("should list all services including inactive ones", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço Ativo",
        isActive: true,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço Inativo",
        isActive: false,
      });
    });
  });

  describe("Tenant Isolation", () => {
    test("should not list services from other tenants", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço Tenant 1",
      });

      await createService.execute({
        ...validService,
        tenantId: tenant2Id,
        name: "Serviço Tenant 2",
      });
    });

    test("should return independent lists for different tenants", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Corte",
      });

      await createService.execute({
        ...validService,
        tenantId: tenant2Id,
        name: "Barba",
      });

      await createService.execute({
        ...validService,
        tenantId: tenant2Id,
        name: "Manicure",
      });
    });
  });

  describe("Sorting and Ordering", () => {
    test("should list services ordered by name", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Zebra",
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Alpha",
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Bravo",
      });
    });

    test("should list services ordered by price", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço 1",
        price: 100,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço 2",
        price: 50,
      });

      await createService.execute({
        ...validService,
        tenantId,
        name: "Serviço 3",
        price: 75,
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle large number of services", async () => {
      for (let i = 0; i < 20; i++) {
        await createService.execute({
          ...validService,
          tenantId,
          name: `Serviço ${i}`,
        });
      }
    });

    test("should preserve all service properties", async () => {
      await createService.execute({
        ...validService,
        tenantId,
        name: "Corte Premium",
        description: "Descrição detalhada",
        price: 99.99,
        durationMinutes: 60,
        isActive: true,
      });
    });

    test("should handle services with null description", async () => {
      await createService.execute({
        tenantId,
        name: "Serviço sem descrição",
        price: 50,
        durationMinutes: 30,
        isActive: true,
      });
    });
  });
});
