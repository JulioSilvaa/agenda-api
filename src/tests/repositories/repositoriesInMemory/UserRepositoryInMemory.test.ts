import { describe, expect, test, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { UserRepositoryInMemory } from '../../../infra/repositories/repositoryInMemory/UserRepositoryInMemory';
import { UserEntity } from '../../../core/entities/UserEntity';
import { UserRole } from '../../../core/interfaces/User';

describe('Unit test UserRepositoryInMemory', () => {
  let repository: UserRepositoryInMemory;
  const tenantId = 'tenant-123';
  const tenantId2 = 'tenant-456';

  beforeEach(() => {
    repository = new UserRepositoryInMemory();
  });

  const createValidUser = async (
    email: string,
    tenant: string = tenantId,
    role: UserRole = UserRole.ADMIN
  ) => {
    const hashedPassword = await bcrypt.hash('senha123', 10);
    return UserEntity.create({
      id: crypto.randomUUID(),
      tenantId: tenant,
      name: 'João Silva',
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('create method', () => {
    test('should create and return user', async () => {
      const user = await createValidUser('test@example.com');
      const createdUser = await repository.create(user);

      expect(createdUser).toBeDefined();
      expect(createdUser).toBe(user);
      expect(createdUser.email).toBe('test@example.com');
    });

    test('should store user in memory', async () => {
      const user = await createValidUser('stored@example.com');
      await repository.create(user);

      const foundUser = await repository.findByEmail('stored@example.com', tenantId);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('stored@example.com');
    });

    test('should create multiple users', async () => {
      const user1 = await createValidUser('user1@example.com');
      const user2 = await createValidUser('user2@example.com');
      const user3 = await createValidUser('user3@example.com');

      await repository.create(user1);
      await repository.create(user2);
      await repository.create(user3);

      const users = await repository.findByTenantId(tenantId);
      expect(users.length).toBe(3);
    });

    test('should preserve all user properties', async () => {
      const user = await createValidUser('preserve@example.com', tenantId, UserRole.STAFF);
      await repository.create(user);

      const foundUser = await repository.findByEmail('preserve@example.com', tenantId);
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.tenantId).toBe(tenantId);
      expect(foundUser?.name).toBe(user.name);
      expect(foundUser?.email).toBe(user.email);
      expect(foundUser?.role).toBe(UserRole.STAFF);
      expect(foundUser?.isActive).toBe(true);
    });

    test('should allow duplicate emails in different tenants', async () => {
      const user1 = await createValidUser('same@example.com', tenantId);
      const user2 = await createValidUser('same@example.com', tenantId2);

      await repository.create(user1);
      await repository.create(user2);

      const foundUser1 = await repository.findByEmail('same@example.com', tenantId);
      const foundUser2 = await repository.findByEmail('same@example.com', tenantId2);

      expect(foundUser1).toBeDefined();
      expect(foundUser2).toBeDefined();
      expect(foundUser1?.tenantId).toBe(tenantId);
      expect(foundUser2?.tenantId).toBe(tenantId2);
    });
  });

  describe('findByEmail method', () => {
    test('should find user by email and tenantId', async () => {
      const user = await createValidUser('find@example.com');
      await repository.create(user);

      const foundUser = await repository.findByEmail('find@example.com', tenantId);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('find@example.com');
    });

    test('should return null when user not found', async () => {
      const foundUser = await repository.findByEmail('notfound@example.com', tenantId);
      expect(foundUser).toBeNull();
    });

    test('should return null when email exists but tenant is different', async () => {
      const user = await createValidUser('email@example.com', tenantId);
      await repository.create(user);

      const foundUser = await repository.findByEmail('email@example.com', 'wrong-tenant');
      expect(foundUser).toBeNull();
    });

    test('should be case sensitive for email', async () => {
      const user = await createValidUser('CaseSensitive@example.com');
      await repository.create(user);

      const foundLower = await repository.findByEmail('casesensitive@example.com', tenantId);
      expect(foundLower).toBeNull();
    });

    test('should find correct user when multiple users exist', async () => {
      const user1 = await createValidUser('user1@example.com');
      const user2 = await createValidUser('user2@example.com');
      const user3 = await createValidUser('user3@example.com');

      await repository.create(user1);
      await repository.create(user2);
      await repository.create(user3);

      const foundUser = await repository.findByEmail('user2@example.com', tenantId);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('user2@example.com');
    });

    test('should handle empty email gracefully', async () => {
      const foundUser = await repository.findByEmail('', tenantId);
      expect(foundUser).toBeNull();
    });

    test('should handle empty tenantId gracefully', async () => {
      const user = await createValidUser('test@example.com');
      await repository.create(user);

      const foundUser = await repository.findByEmail('test@example.com', '');
      expect(foundUser).toBeNull();
    });

    test('should find user with special characters in email', async () => {
      const user = await createValidUser('user+tag@example.com');
      await repository.create(user);

      const foundUser = await repository.findByEmail('user+tag@example.com', tenantId);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('user+tag@example.com');
    });
  });

  describe('findByTenantId method', () => {
    test('should find all users by tenantId', async () => {
      const user1 = await createValidUser('user1@example.com');
      const user2 = await createValidUser('user2@example.com');
      const user3 = await createValidUser('user3@example.com');

      await repository.create(user1);
      await repository.create(user2);
      await repository.create(user3);

      const users = await repository.findByTenantId(tenantId);
      expect(users.length).toBe(3);
    });

    test('should return empty array when no users found', async () => {
      const users = await repository.findByTenantId('nonexistent-tenant');
      expect(users).toEqual([]);
      expect(users.length).toBe(0);
    });

    test('should return only users from specified tenant', async () => {
      const user1 = await createValidUser('user1@example.com', tenantId);
      const user2 = await createValidUser('user2@example.com', tenantId2);
      const user3 = await createValidUser('user3@example.com', tenantId);

      await repository.create(user1);
      await repository.create(user2);
      await repository.create(user3);

      const users = await repository.findByTenantId(tenantId);
      expect(users.length).toBe(2);
      expect(users.every(u => u.tenantId === tenantId)).toBe(true);
    });

    test('should return users with different roles', async () => {
      const admin = await createValidUser('admin@example.com', tenantId, UserRole.ADMIN);
      const staff = await createValidUser('staff@example.com', tenantId, UserRole.STAFF);

      await repository.create(admin);
      await repository.create(staff);

      const users = await repository.findByTenantId(tenantId);
      expect(users.length).toBe(2);

      const roles = users.map(u => u.role);
      expect(roles).toContain(UserRole.ADMIN);
      expect(roles).toContain(UserRole.STAFF);
    });

    test('should return both active and inactive users', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      const activeUser = UserEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Active User',
        email: 'active@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const inactiveUser = UserEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(activeUser);
      await repository.create(inactiveUser);

      const users = await repository.findByTenantId(tenantId);
      expect(users.length).toBe(2);

      const activeStates = users.map(u => u.isActive);
      expect(activeStates).toContain(true);
      expect(activeStates).toContain(false);
    });

    test('should handle empty tenantId gracefully', async () => {
      const users = await repository.findByTenantId('');
      expect(users).toEqual([]);
    });

    test('should preserve order of creation', async () => {
      const user1 = await createValidUser('first@example.com');
      const user2 = await createValidUser('second@example.com');
      const user3 = await createValidUser('third@example.com');

      await repository.create(user1);
      await repository.create(user2);
      await repository.create(user3);

      const users = await repository.findByTenantId(tenantId);
      expect(users[0].email).toBe('first@example.com');
      expect(users[1].email).toBe('second@example.com');
      expect(users[2].email).toBe('third@example.com');
    });
  });

  describe('Integration scenarios', () => {
    test('should handle complete user lifecycle', async () => {
      // Criar usuário
      const user = await createValidUser('lifecycle@example.com');
      await repository.create(user);

      // Buscar por email
      const foundByEmail = await repository.findByEmail('lifecycle@example.com', tenantId);
      expect(foundByEmail).toBeDefined();

      // Buscar por tenant
      const foundByTenant = await repository.findByTenantId(tenantId);
      expect(foundByTenant.length).toBe(1);
      expect(foundByTenant[0].email).toBe('lifecycle@example.com');
    });

    test('should handle multiple tenants with multiple users', async () => {
      // Tenant 1
      await repository.create(await createValidUser('user1@tenant1.com', tenantId));
      await repository.create(await createValidUser('user2@tenant1.com', tenantId));

      // Tenant 2
      await repository.create(await createValidUser('user1@tenant2.com', tenantId2));
      await repository.create(await createValidUser('user2@tenant2.com', tenantId2));

      const tenant1Users = await repository.findByTenantId(tenantId);
      const tenant2Users = await repository.findByTenantId(tenantId2);

      expect(tenant1Users.length).toBe(2);
      expect(tenant2Users.length).toBe(2);
    });

    test('should find user after creating many users', async () => {
      const targetEmail = 'target@example.com';

      // Criar alguns usuários
      for (let i = 0; i < 10; i++) {
        await repository.create(await createValidUser(`user${i}@example.com`));
      }

      // Criar usuário alvo
      const targetUser = await createValidUser(targetEmail);
      await repository.create(targetUser);

      // Criar mais usuários
      for (let i = 10; i < 20; i++) {
        await repository.create(await createValidUser(`user${i}@example.com`));
      }

      const foundUser = await repository.findByEmail(targetEmail, tenantId);
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(targetEmail);

      const allUsers = await repository.findByTenantId(tenantId);
      expect(allUsers.length).toBe(21);
    });
  });

  describe('Error handling and edge cases', () => {
    test('should not throw error when searching in empty repository', async () => {
      const foundUser = await repository.findByEmail('any@example.com', tenantId);
      expect(foundUser).toBeNull();

      const users = await repository.findByTenantId(tenantId);
      expect(users).toEqual([]);
    });

    test('should handle users with identical names but different emails', async () => {
      const hashedPassword = await bcrypt.hash('senha123', 10);

      const user1 = UserEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'João Silva',
        email: 'joao1@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user2 = UserEntity.create({
        id: crypto.randomUUID(),
        tenantId,
        name: 'João Silva',
        email: 'joao2@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.create(user1);
      await repository.create(user2);

      const foundUser1 = await repository.findByEmail('joao1@example.com', tenantId);
      const foundUser2 = await repository.findByEmail('joao2@example.com', tenantId);

      expect(foundUser1?.name).toBe('João Silva');
      expect(foundUser2?.name).toBe('João Silva');
      expect(foundUser1?.id).not.toBe(foundUser2?.id);
    });
  });
});
