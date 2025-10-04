import { describe, expect, test } from 'vitest';
import { UserEntity } from '../../core/entities/UserEntity';
import { UserRole } from '../../core/interfaces/User';

describe('Unit test UserEntity', () => {
  const validUserData = {
    id: '123',
    tenantId: 'tenant-123',
    name: 'João Silva',
    email: 'joao@empresa.com',
    password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Entity Creation', () => {
    test('should create user with valid data', () => {
      const user = UserEntity.create(validUserData);

      expect(user).toBeDefined();
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.isActive).toBe(true);
    });

    test('should create user with default isActive as true', () => {
      const user = UserEntity.create({
        ...validUserData,
        isActive: undefined as any,
      });

      expect(user.isActive).toBe(true);
    });

    test('should create inactive user', () => {
      const user = UserEntity.create({
        ...validUserData,
        isActive: false,
      });

      expect(user.isActive).toBe(false);
    });
  });

  describe('Name Validation', () => {
    test('should reject empty name', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          name: '',
        })
      ).toThrow('Nome é obrigatório');
    });

    test('should reject name with only spaces', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          name: '   ',
        })
      ).toThrow('Nome é obrigatório');
    });

    test('should reject name with less than 3 characters', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          name: 'ab',
        })
      ).toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should accept name with exactly 3 characters', () => {
      const user = UserEntity.create({
        ...validUserData,
        name: 'Ana',
      });

      expect(user.name).toBe('Ana');
    });

    test('should reject name with more than 100 characters', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          name: 'a'.repeat(101),
        })
      ).toThrow('Nome não pode ter mais de 100 caracteres');
    });
  });

  describe('Email Validation', () => {
    test('should accept valid email', () => {
      const user = UserEntity.create(validUserData);
      expect(user.email).toBe('joao@empresa.com');
    });

    test('should reject email without @', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          email: 'emailinvalido.com',
        })
      ).toThrow('Email inválido');
    });

    test('should reject empty email', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          email: '',
        })
      ).toThrow('Email é obrigatório');
    });

    test('should accept email with subdomain', () => {
      const user = UserEntity.create({
        ...validUserData,
        email: 'joao@mail.empresa.com',
      });

      expect(user.email).toBe('joao@mail.empresa.com');
    });
  });

  describe('Password Validation', () => {
    test('should accept hashed password', () => {
      const user = UserEntity.create(validUserData);
      expect(user.password).toBeDefined();
    });

    test('should reject empty password', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          password: '',
        })
      ).toThrow('Senha é obrigatória');
    });

    test('should reject unhashed password', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          password: 'senha123',
        })
      ).toThrow('Senha deve estar hasheada');
    });
  });

  describe('Role Validation', () => {
    test('should accept ADMIN role', () => {
      const user = UserEntity.create({
        ...validUserData,
        role: UserRole.ADMIN,
      });

      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.isAdmin()).toBe(true);
      expect(user.isStaff()).toBe(false);
    });

    test('should accept STAFF role', () => {
      const user = UserEntity.create({
        ...validUserData,
        role: UserRole.STAFF,
      });

      expect(user.role).toBe(UserRole.STAFF);
      expect(user.isStaff()).toBe(true);
      expect(user.isAdmin()).toBe(false);
    });

    test('should reject invalid role', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          role: 'INVALID' as any,
        })
      ).toThrow('Role inválida');
    });
  });

  describe('TenantId Validation', () => {
    test('should reject empty tenantId', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          tenantId: '',
        })
      ).toThrow('TenantId é obrigatório');
    });

    test('should reject tenantId with only spaces', () => {
      expect(() =>
        UserEntity.create({
          ...validUserData,
          tenantId: '   ',
        })
      ).toThrow('TenantId é obrigatório');
    });
  });

  describe('Date Validation', () => {
    test('should accept valid dates', () => {
      const user = UserEntity.create(validUserData);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should reject updatedAt before createdAt', () => {
      const createdAt = new Date();
      const updatedAt = new Date(createdAt.getTime() - 1000);

      expect(() =>
        UserEntity.create({
          ...validUserData,
          createdAt,
          updatedAt,
        })
      ).toThrow('Data de atualização não pode ser anterior à data de criação');
    });
  });

  describe('Domain Methods', () => {
    test('isAdmin should return true for ADMIN role', () => {
      const user = UserEntity.create({
        ...validUserData,
        role: UserRole.ADMIN,
      });

      expect(user.isAdmin()).toBe(true);
    });

    test('isAdmin should return false for STAFF role', () => {
      const user = UserEntity.create({
        ...validUserData,
        role: UserRole.STAFF,
      });

      expect(user.isAdmin()).toBe(false);
    });

    test('isStaff should return true for STAFF role', () => {
      const user = UserEntity.create({
        ...validUserData,
        role: UserRole.STAFF,
      });

      expect(user.isStaff()).toBe(true);
    });

    test('isStaff should return false for ADMIN role', () => {
      const user = UserEntity.create({
        ...validUserData,
        role: UserRole.ADMIN,
      });

      expect(user.isStaff()).toBe(false);
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const user = UserEntity.create(validUserData);

      expect(user.id).toBe(validUserData.id);
      expect(user.tenantId).toBe(validUserData.tenantId);
      expect(user.name).toBe(validUserData.name);
      expect(user.email).toBe(validUserData.email);
      expect(user.password).toBe(validUserData.password);
      expect(user.role).toBe(validUserData.role);
      expect(user.isActive).toBe(validUserData.isActive);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});
