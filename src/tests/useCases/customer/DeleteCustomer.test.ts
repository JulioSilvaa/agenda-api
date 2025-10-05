import { describe, expect, test, beforeEach } from 'vitest';
import { CustomerRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/CustomerRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantyRepositoryInMemory';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
// import { DeleteCustomer } from '../../../core/useCases/customer/Delete'; // TODO: Implementar

describe.skip('Unit test DeleteCustomer UseCase', () => {
  let customerRepository: CustomerRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createCustomer: CreateCustomer;
  let createTenant: CreateTenant;
  // let deleteCustomer: DeleteCustomer; // TODO: Implementar
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
    // deleteCustomer = new DeleteCustomer(customerRepository); // TODO: Implementar
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
    test('should delete existing customer', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await deleteCustomer.execute(customer.id!, tenantId);

      // const foundCustomer = await customerRepository.findById(customer.id!);
      // expect(foundCustomer).toBeNull();
    });

    test('should remove customer from repository', async () => {
      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente1@example.com',
        phone: '11988888881',
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente2@example.com',
        phone: '11988888882',
      });

      // await deleteCustomer.execute(customer1.id!, tenantId);

      // const allCustomers = await customerRepository.findByTenantId(tenantId);
      // expect(allCustomers.length).toBe(1);
      // expect(allCustomers[0].id).toBe(customer2.id);
    });

    test('should delete multiple customers independently', async () => {
      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente1@example.com',
        phone: '11988888881',
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        email: 'cliente2@example.com',
        phone: '11988888882',
      });

      // await deleteCustomer.execute(customer1.id!, tenantId);

      // const found1 = await customerRepository.findById(customer1.id!);
      // const found2 = await customerRepository.findById(customer2.id!);

      // expect(found1).toBeNull();
      // expect(found2).toBeDefined();
    });
  });

  describe('Not Found Errors', () => {
    test('should throw error when customer does not exist', async () => {
      // await expect(() =>
      //   deleteCustomer.execute('non-existent-id', tenantId)
      // ).rejects.toThrow('Cliente não encontrado');
    });

    test('should throw error for empty id', async () => {
      // await expect(() => deleteCustomer.execute('', tenantId)).rejects.toThrow(
      //   'Cliente não encontrado'
      // );
    });
  });

  describe('Tenant Validation', () => {
    test('should throw error when trying to delete customer from different tenant', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await expect(() =>
      //   deleteCustomer.execute(customer.id!, tenant2Id)
      // ).rejects.toThrow('Cliente não pertence a este tenant');
    });

    test('should throw error for invalid tenant id', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await expect(() =>
      //   deleteCustomer.execute(customer.id!, 'wrong-tenant')
      // ).rejects.toThrow('Cliente não pertence a este tenant');
    });
  });

  describe('Edge Cases', () => {
    test('should not affect other tenants customers', async () => {
      const customer1 = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      const customer2 = await createCustomer.execute({
        ...validCustomer,
        tenantId: tenant2Id,
        email: 'outro@example.com',
        phone: '11977777777',
      });

      // await deleteCustomer.execute(customer1.id!, tenantId);

      // const found1 = await customerRepository.findById(customer1.id!);
      // const found2 = await customerRepository.findById(customer2.id!);

      // expect(found1).toBeNull();
      // expect(found2).toBeDefined();
    });

    test('should handle deletion of already deleted customer', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
      });

      // await deleteCustomer.execute(customer.id!, tenantId);

      // await expect(() =>
      //   deleteCustomer.execute(customer.id!, tenantId)
      // ).rejects.toThrow('Cliente não encontrado');
    });

    test('should delete inactive customer', async () => {
      const customer = await createCustomer.execute({
        ...validCustomer,
        tenantId,
        isActive: false,
      });

      // await deleteCustomer.execute(customer.id!, tenantId);

      // const foundCustomer = await customerRepository.findById(customer.id!);
      // expect(foundCustomer).toBeNull();
    });
  });
});
