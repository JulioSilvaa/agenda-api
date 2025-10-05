import { describe, expect, test, beforeEach } from 'vitest';
import { CustomerRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
// import { UpdateCustomer } from '../../../core/useCases/customer/Update'; // TODO: Implementar

describe.skip('Unit test UpdateCustomer UseCase', () => {
  let customerRepository: CustomerRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createCustomer: CreateCustomer;
  let createTenant: CreateTenant;
  // let updateCustomer: UpdateCustomer; // TODO: Implementar
  let tenantId: string;

  const validTenant = {
    name: 'Salão de Beleza',
    email: 'salao@example.com',
    slug: 'salao-beleza',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  const validCustomer = {
    name: 'João da Silva',
    email: 'joao@example.com',
    phone: '11988888888',
    isActive: true,
  };

  beforeEach(async () => {
    customerRepository = new CustomerRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createCustomer = new CreateCustomer(customerRepository, tenantRepository);
    // updateCustomer = new UpdateCustomer(customerRepository, tenantRepository); // TODO: Implementar
    createTenant = new CreateTenant(tenantRepository);

    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Update', () => {
    test('should update customer name', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: 'João Pedro da Silva',
      //   email: customer.email,
      //   phone: customer.phone,
      //   isActive: customer.isActive,
      // });

      // expect(updated.name).toBe('João Pedro da Silva');
      // expect(updated.updatedAt.getTime()).toBeGreaterThan(customer.createdAt.getTime());
    });

    test('should update customer email', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: customer.name,
      //   email: 'novo@example.com',
      //   phone: customer.phone,
      //   isActive: customer.isActive,
      // });

      // expect(updated.email).toBe('novo@example.com');
    });

    test('should update customer phone', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: customer.name,
      //   email: customer.email,
      //   phone: '11977777777',
      //   isActive: customer.isActive,
      // });

      // expect(updated.phone).toBe('11977777777');
    });

    test('should update customer active status', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: customer.name,
      //   email: customer.email,
      //   phone: customer.phone,
      //   isActive: false,
      // });

      // expect(updated.isActive).toBe(false);
    });

    test('should update multiple fields at once', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: 'Novo Nome',
      //   email: 'novo@example.com',
      //   phone: '11966666666',
      //   isActive: false,
      // });

      // expect(updated.name).toBe('Novo Nome');
      // expect(updated.email).toBe('novo@example.com');
      // expect(updated.phone).toBe('11966666666');
      // expect(updated.isActive).toBe(false);
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when customer does not exist', async () => {
      // await expect(() =>
      //   updateCustomer.execute({
      //     id: 'non-existent-id',
      //     tenantId,
      //     name: 'Nome',
      //     email: 'email@example.com',
      //     phone: '11999999999',
      //     isActive: true,
      //   })
      // ).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to update customer from different tenant', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'outro@example.com',
        slug: 'outro',
      });

      // await expect(() =>
      //   updateCustomer.execute({
      //     id: customer.id!,
      //     tenantId: tenant2.id!,
      //     name: customer.name,
      //     email: customer.email,
      //     phone: customer.phone,
      //     isActive: customer.isActive,
      //   })
      // ).rejects.toThrow('Cliente não pertence a este tenant');
    });
  });

  describe('Email Uniqueness Validation', () => {
    test('should throw error when updating to duplicate email', async () => {
      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente1@example.com',
        phone: '11988888881',
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente2@example.com',
        phone: '11988888882',
      });

      // await expect(() =>
      //   updateCustomer.execute({
      //     id: customer1.id!,
      //     tenantId,
      //     name: customer1.name,
      //     email: 'cliente2@example.com',
      //     phone: customer1.phone,
      //     isActive: customer1.isActive,
      //   })
      // ).rejects.toThrow('Já existe um cliente com este email neste tenant');
    });

    test('should allow update with same email (no change)', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: 'Nome Atualizado',
      //   email: customer.email,
      //   phone: customer.phone,
      //   isActive: customer.isActive,
      // });

      // expect(updated.email).toBe(customer.email);
      // expect(updated.name).toBe('Nome Atualizado');
    });
  });

  describe('Phone Uniqueness Validation', () => {
    test('should throw error when updating to duplicate phone', async () => {
      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente1@example.com',
        phone: '11988888881',
      });

      await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente2@example.com',
        phone: '11988888882',
      });

      // await expect(() =>
      //   updateCustomer.execute({
      //     id: customer1.id!,
      //     tenantId,
      //     name: customer1.name,
      //     email: customer1.email,
      //     phone: '11988888882',
      //     isActive: customer1.isActive,
      //   })
      // ).rejects.toThrow('Já existe um cliente com este telefone neste tenant');
    });

    test('should allow update with same phone (no change)', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // const updated = await updateCustomer.execute({
      //   id: customer.id!,
      //   tenantId,
      //   name: 'Nome Atualizado',
      //   email: customer.email,
      //   phone: customer.phone,
      //   isActive: customer.isActive,
      // });

      // expect(updated.phone).toBe(customer.phone);
      // expect(updated.name).toBe('Nome Atualizado');
    });
  });

  describe('Entity Validation Errors', () => {
    test('should throw error for invalid name', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await expect(() =>
      //   updateCustomer.execute({
      //     id: customer.id!,
      //     tenantId,
      //     name: 'Ab',
      //     email: customer.email,
      //     phone: customer.phone,
      //     isActive: customer.isActive,
      //   })
      // ).rejects.toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should throw error for invalid email', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await expect(() =>
      //   updateCustomer.execute({
      //     id: customer.id!,
      //     tenantId,
      //     name: customer.name,
      //     email: 'invalid-email',
      //     phone: customer.phone,
      //     isActive: customer.isActive,
      //   })
      // ).rejects.toThrow('Email inválido');
    });

    test('should throw error for invalid phone', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await expect(() =>
      //   updateCustomer.execute({
      //     id: customer.id!,
      //     tenantId,
      //     name: customer.name,
      //     email: customer.email,
      //     phone: '123',
      //     isActive: customer.isActive,
      //   })
      // ).rejects.toThrow('Telefone inválido');
    });
  });
});
