import * as bcrypt from 'bcryptjs';
import { describe, expect, test, beforeEach } from 'vitest';
import { UserRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/UserRepositoryInMemory';
import { TenantRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/TenantRepositoryInMemory';
import { CreateUser } from '../../../core/useCases/user/Create';
import { CreateTenant } from '../../../core/useCases/tenant/Create';
import { UserRole } from '../../../core/interfaces/User';

describe('Unit test CreateUser UseCase', () => {
  let userRepository: UserRepositoryInMemory;
  let tenantRepository: TenantRepositoryInMemory;
  let createUser: CreateUser;
  let createTenant: CreateTenant;
  let tenantId: string;

  const validTenant = {
    name: 'Empresa Teste',
    email: 'teste@empresa.com',
    slug: 'empresa-teste',
    phone: '11999999999',
    password: 'Senha#123',
    isActive: true,
    address: 'Rua Teste, 123',
  };

  const validUser = {
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123',
    role: UserRole.ADMIN,
    isActive: true,
  };

  beforeEach(async () => {
    userRepository = new UserRepositoryInMemory();
    tenantRepository = new TenantRepositoryInMemory();
    createUser = new CreateUser(userRepository, tenantRepository);
    createTenant = new CreateTenant(tenantRepository);

    // Criar tenant para os testes
    const tenant = await createTenant.execute(validTenant);
    tenantId = tenant.id!;
  });

  describe('Successful Creation', () => {
    test('should create user with all fields', async () => {
      const userData = {
        ...validUser,
        tenantId,
      };

      const createdUser = await createUser.execute(userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe(validUser.name);
      expect(createdUser.email).toBe(validUser.email);
      expect(createdUser.role).toBe(UserRole.ADMIN);
      expect(createdUser.isActive).toBe(true);
      expect(createdUser.tenantId).toBe(tenantId);
      expect(createdUser.createdAt).toBeInstanceOf(Date);
      expect(createdUser.updatedAt).toBeInstanceOf(Date);
    });

    test('should hash password when creating user', async () => {
      const userData = {
        ...validUser,
        tenantId,
      };

      const createdUser = await createUser.execute(userData);

      expect(createdUser.password).not.toBe(validUser.password);
      expect(createdUser.password.length).toBeGreaterThanOrEqual(60);

      const isPasswordValid = await bcrypt.compare(validUser.password, createdUser.password);
      expect(isPasswordValid).toBe(true);
    });

    test('should create user with STAFF role', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'staff@example.com',
        role: UserRole.STAFF,
      };

      const createdUser = await createUser.execute(userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.role).toBe(UserRole.STAFF);
      expect(createdUser.isStaff()).toBe(true);
      expect(createdUser.isAdmin()).toBe(false);
    });

    test('should persist user in repository', async () => {
      const userData = {
        ...validUser,
        tenantId,
      };

      await createUser.execute(userData);

      const savedUser = await userRepository.findByEmail(validUser.email, tenantId);
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe(validUser.email);
    });

    test('should create multiple users in same tenant', async () => {
      const user1 = await createUser.execute({
        ...validUser,
        tenantId,
        email: 'user1@example.com',
      });

      const user2 = await createUser.execute({
        ...validUser,
        tenantId,
        email: 'user2@example.com',
      });

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1.email).not.toBe(user2.email);
      expect(user1.tenantId).toBe(user2.tenantId);
    });

    test('should create users with same email in different tenants', async () => {
      // Criar segundo tenant
      const tenant2 = await createTenant.execute({
        ...validTenant,
        email: 'empresa2@example.com',
        slug: 'empresa-2',
      });

      const user1 = await createUser.execute({
        ...validUser,
        tenantId,
        email: 'same@example.com',
      });

      const user2 = await createUser.execute({
        ...validUser,
        tenantId: tenant2.id!,
        email: 'same@example.com',
      });

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1.email).toBe(user2.email);
      expect(user1.tenantId).not.toBe(user2.tenantId);
    });

    test('should create inactive user', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'inactive@example.com',
        isActive: false,
      };

      const createdUser = await createUser.execute(userData);

      expect(createdUser).toBeDefined();
      expect(createdUser.isActive).toBe(false);
    });
  });

  describe('Tenant Validation Errors', () => {
    test('should throw error if tenant does not exist', async () => {
      const userData = {
        ...validUser,
        tenantId: 'tenant-inexistente',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Tenant não encontrado');
    });

    test('should throw error for null tenantId', async () => {
      const userData = {
        ...validUser,
        tenantId: null as any,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });

    test('should throw error for undefined tenantId', async () => {
      const userData = {
        ...validUser,
        tenantId: undefined as any,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });

    test('should throw error for empty tenantId', async () => {
      const userData = {
        ...validUser,
        tenantId: '',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });
  });

  describe('Email Uniqueness Validation', () => {
    test('should not allow duplicate email in same tenant', async () => {
      const userData = {
        ...validUser,
        tenantId,
      };

      await createUser.execute(userData);

      await expect(() => createUser.execute(userData)).rejects.toThrow(
        'Já existe um usuário com este email neste tenant'
      );
    });

    test('should reject duplicate email even with different data in same tenant', async () => {
      await createUser.execute({
        ...validUser,
        tenantId,
      });

      const duplicateEmailUser = {
        name: 'Outro Usuário',
        email: validUser.email, // mesmo email
        password: 'outrasenha123',
        role: UserRole.STAFF,
        tenantId,
        isActive: true,
      };

      await expect(() => createUser.execute(duplicateEmailUser)).rejects.toThrow(
        'Já existe um usuário com este email neste tenant'
      );
    });

    test('should allow same name but different email in same tenant', async () => {
      await createUser.execute({
        ...validUser,
        tenantId,
      });

      const user2 = await createUser.execute({
        ...validUser,
        tenantId,
        email: 'outro@example.com',
      });

      expect(user2).toBeDefined();
      expect(user2.name).toBe(validUser.name);
    });
  });

  describe('Entity Validation Errors - Name', () => {
    test('should throw error for empty name', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: '',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Nome é obrigatório');
    });

    test('should throw error for name with only spaces', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: '   ',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Nome é obrigatório');
    });

    test('should throw error for name less than 3 characters', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: 'Ab',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow(
        'Nome deve ter pelo menos 3 caracteres'
      );
    });

    test('should throw error for name with more than 100 characters', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: 'a'.repeat(101),
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow(
        'Nome não pode ter mais de 100 caracteres'
      );
    });

    test('should throw error for null name', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: null as any,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Nome é obrigatório');
    });

    test('should throw error for undefined name', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: undefined as any,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Nome é obrigatório');
    });
  });

  describe('Entity Validation Errors - Email', () => {
    test('should throw error for invalid email format', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'emailinvalido',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email inválido');
    });

    test('should throw error for email without @', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'emailexample.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email inválido');
    });

    test('should throw error for email without domain', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'email@',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email inválido');
    });

    test('should throw error for empty email', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: '',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email é obrigatório');
    });

    test('should throw error for email with only spaces', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: '   ',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email é obrigatório');
    });

    test('should throw error for null email', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: null as any,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email é obrigatório');
    });

    test('should throw error for undefined email', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: undefined as any,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Email é obrigatório');
    });
  });

  describe('Entity Validation Errors - Password', () => {
    test('should throw error for empty password', async () => {
      const userData = {
        ...validUser,
        tenantId,
        password: '',
        email: 'testpassword1@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });

    test('should throw error for password with only spaces', async () => {
      const userData = {
        ...validUser,
        tenantId,
        password: '   ',
        email: 'testpassword2@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });

    test('should throw error for null password', async () => {
      const userData = {
        ...validUser,
        tenantId,
        password: null as any,
        email: 'testpassword3@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });

    test('should throw error for undefined password', async () => {
      const userData = {
        ...validUser,
        tenantId,
        password: undefined as any,
        email: 'testpassword4@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });
  });

  describe('Entity Validation Errors - Role', () => {
    test('should throw error for invalid role', async () => {
      const userData = {
        ...validUser,
        tenantId,
        role: 'INVALID_ROLE' as any,
        email: 'testrole1@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Role inválida');
    });

    test('should throw error for null role', async () => {
      const userData = {
        ...validUser,
        tenantId,
        role: null as any,
        email: 'testrole2@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Role inválida');
    });

    test('should throw error for undefined role', async () => {
      const userData = {
        ...validUser,
        tenantId,
        role: undefined as any,
        email: 'testrole3@example.com',
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow('Role inválida');
    });
  });

  describe('Entity Validation Errors - Dates', () => {
    test('should create user with valid dates', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'testdates@example.com',
      };

      const createdUser = await createUser.execute(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.createdAt).toBeInstanceOf(Date);
      expect(createdUser.updatedAt).toBeInstanceOf(Date);
      expect(createdUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createdUser.createdAt.getTime()
      );
    });
  });

  describe('Multiple Validation Errors', () => {
    test('should throw error for multiple invalid fields', async () => {
      const userData = {
        name: 'ab',
        email: 'emailinvalido',
        password: '',
        role: 'INVALID' as any,
        tenantId,
        isActive: true,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });

    test('should throw error for all empty fields', async () => {
      const userData = {
        name: '',
        email: '',
        password: '',
        role: null as any,
        tenantId: '',
        isActive: true,
      };

      await expect(() => createUser.execute(userData)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle user with exactly 3 characters in name', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: 'abc',
        email: 'abc@example.com',
      };

      const createdUser = await createUser.execute(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.name).toBe('abc');
    });

    test('should handle user with exactly 100 characters in name', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: 'a'.repeat(100),
        email: 'longname@example.com',
      };

      const createdUser = await createUser.execute(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.name.length).toBe(100);
    });

    test('should handle user with special characters in name', async () => {
      const userData = {
        ...validUser,
        tenantId,
        name: 'João da Silva Côrrea',
        email: 'special@example.com',
      };

      const createdUser = await createUser.execute(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.name).toBe('João da Silva Côrrea');
    });

    test('should handle email with subdomain', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'user@mail.company.com.br',
      };

      const createdUser = await createUser.execute(userData);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe('user@mail.company.com.br');
    });

    test('should handle complex password', async () => {
      const userData = {
        ...validUser,
        tenantId,
        email: 'complex@example.com',
        password: 'P@ssw0rd!Complex#2024$',
      };

      const createdUser = await createUser.execute(userData);
      expect(createdUser).toBeDefined();

      const isPasswordValid = await bcrypt.compare('P@ssw0rd!Complex#2024$', createdUser.password);
      expect(isPasswordValid).toBe(true);
    });

    test('should handle multiple users created in sequence', async () => {
      const users = [];

      for (let i = 0; i < 5; i++) {
        const user = await createUser.execute({
          ...validUser,
          tenantId,
          email: `user${i}@example.com`,
        });
        users.push(user);
      }

      expect(users.length).toBe(5);
      const emails = users.map(u => u.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(5);
    });

    test('should handle user creation with timestamp validation', async () => {
      const beforeCreation = new Date();

      const userData = {
        ...validUser,
        tenantId,
        email: 'timestamp@example.com',
      };

      const createdUser = await createUser.execute(userData);
      const afterCreation = new Date();

      expect(createdUser.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(createdUser.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(createdUser.updatedAt.getTime()).toBe(createdUser.createdAt.getTime());
    });
  });
});
