import { describe, expect, test, beforeEach } from 'vitest';
import crypto from 'crypto';
import { CreateCustomer } from '../../../core/useCases/customer/Create';
import { CustomerRepositorySqlite } from '../../../infra/repositories/sqlite/CustomerRepositorySqlite';
import { TenantRepositorySqlite } from '../../../infra/repositories/sqlite/TenantRepositorySqlite';
import { TenantEntity } from '../../../core/entities/TenantEntity';

process.env.SQLITE_DB_PATH = ':memory:'; // cada arquivo usa um banco em memória

describe('UseCase CreateCustomer (SQLite)', () => {
  let customerRepo: CustomerRepositorySqlite;
  let tenantRepo: TenantRepositorySqlite;
  let useCase: CreateCustomer;
  let tenantId: string;

  beforeEach(async () => {
    customerRepo = new CustomerRepositorySqlite();
    tenantRepo = new TenantRepositorySqlite();
    tenantId = crypto.randomUUID();
    const tenant = TenantEntity.create({
      id: tenantId,
      name: 'Tenant Test',
      slug: 'tenant-test-' + Math.random().toString(16).slice(2),
      email: 'tenant' + Math.random().toString(16).slice(2) + '@example.com',
      phone: '11988887777',
      isActive: true,
      address: 'Rua X',
      password: 'Abcdef1!',
    });
    await tenantRepo.create(tenant);
    useCase = new CreateCustomer(customerRepo, tenantRepo);
  });

  test('should create a customer successfully', async () => {
    const result = await useCase.execute({
      tenantId,
      name: 'Cliente Novo',
      email: 'cliente.novo@example.com',
      phone: '11990001111',
      isActive: true,
      totalBookings: 0,
    });
    expect(result.id).toBeDefined();
    expect(result.tenantId).toBe(tenantId);
    expect(result.email).toBe('cliente.novo@example.com');
  });

  test('should not allow duplicate email in same tenant', async () => {
    await useCase.execute({
      tenantId,
      name: 'Primeiro',
      email: 'dup@example.com',
      phone: '11990002222',
      isActive: true,
      totalBookings: 0,
    });
    await expect(
      useCase.execute({
        tenantId,
        name: 'Segundo',
        email: 'dup@example.com',
        phone: '11990003333',
        isActive: true,
        totalBookings: 0,
      })
    ).rejects.toThrow('Já existe um cliente com este email neste tenant');
  });

  test('should not allow duplicate phone in same tenant', async () => {
    await useCase.execute({
      tenantId,
      name: 'Primeiro',
      email: 'phone1@example.com',
      phone: '11991112222',
      isActive: true,
      totalBookings: 0,
    });
    await expect(
      useCase.execute({
        tenantId,
        name: 'Segundo',
        email: 'phone2@example.com',
        phone: '11991112222',
        isActive: true,
        totalBookings: 0,
      })
    ).rejects.toThrow('Já existe um cliente com este telefone neste tenant');
  });

  test('should reject when tenant does not exist', async () => {
    await expect(
      useCase.execute({
        tenantId: 'inexistente',
        name: 'Sem Tenant',
        email: 'semtenant@example.com',
        phone: '11993334444',
        isActive: true,
        totalBookings: 0,
      })
    ).rejects.toThrow('Tenant não encontrado');
  });
});
