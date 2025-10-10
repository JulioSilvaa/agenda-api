import { describe, expect, test } from 'vitest';
import { TenantEntity } from '../../../core/entities/TenantEntity';

describe('Unit test TenantEntity', () => {
  const validTenantData = {
    name: 'Empresa Teste',
    email: 'teste@empresa.com',
    slug: 'empresa-teste',
    phone: '11999999999',
    isActive: true,
    address: 'Rua Teste, 123',
    password: 'Senha#123',
  };

  describe('Entity Creation', () => {
    test('should create tenant with valid data', () => {
      const tenant = TenantEntity.create(validTenantData);

      expect(tenant).toBeDefined();
      expect(tenant.name).toBe(validTenantData.name);
      expect(tenant.email).toBe(validTenantData.email);
      expect(tenant.slug).toBe(validTenantData.slug);
      expect(tenant.phone).toBe(validTenantData.phone);
      expect(tenant.isActive).toBe(true);
      expect(tenant.address).toBe(validTenantData.address);
    });

    test('should create tenant without optional fields', () => {
      const tenant = TenantEntity.create({
        name: 'Empresa Teste',
        email: 'teste@empresa.com',
        slug: 'empresa-teste',
        isActive: true,
        password: 'Senha#123',
      });

      expect(tenant).toBeDefined();
      expect(tenant.phone).toBeNull();
      expect(tenant.address).toBeNull();
    });

    test('should create tenant with null optional fields', () => {
      const tenant = TenantEntity.create({
        name: 'Empresa Teste',
        email: 'teste@empresa.com',
        slug: 'empresa-teste',
        phone: null,
        address: null,
        isActive: true,
        password: 'Senha#123',
      });

      expect(tenant).toBeDefined();
      expect(tenant.phone).toBeNull();
      expect(tenant.address).toBeNull();
    });
  });

  describe('Name Validation', () => {
    test('should reject empty name', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          name: '',
        })
      ).toThrow('Nome do tenant deve ter pelo menos 3 caracteres');
    });

    test('should reject name with only spaces', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          name: '   ',
        })
      ).toThrow('Nome do tenant deve ter pelo menos 3 caracteres');
    });

    test('should reject name with less than 3 characters', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          name: 'ab',
        })
      ).toThrow('Nome do tenant deve ter pelo menos 3 caracteres');
    });

    test('should accept name with exactly 3 characters', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        name: 'ABC',
      });

      expect(tenant.name).toBe('ABC');
    });

    test('should accept name with spaces', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        name: 'Empresa de Teste LTDA',
      });

      expect(tenant.name).toBe('Empresa de Teste LTDA');
    });

    test('should accept name with special characters', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        name: 'Empresa & Cia',
      });

      expect(tenant.name).toBe('Empresa & Cia');
    });
  });

  describe('Email Validation', () => {
    test('should accept valid email', () => {
      const tenant = TenantEntity.create(validTenantData);
      expect(tenant.email).toBe('teste@empresa.com');
    });

    test('should reject email without @', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          email: 'emailinvalido.com',
        })
      ).toThrow('Email inválido');
    });

    test('should reject email without domain', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          email: 'teste@',
        })
      ).toThrow('Email inválido');
    });

    test('should reject email without local part', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          email: '@empresa.com',
        })
      ).toThrow('Email inválido');
    });

    test('should reject email with spaces', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          email: 'teste @empresa.com',
        })
      ).toThrow('Email inválido');
    });

    test('should reject empty email', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          email: '',
        })
      ).toThrow('Email inválido');
    });

    test('should accept email with subdomain', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        email: 'teste@mail.empresa.com',
      });

      expect(tenant.email).toBe('teste@mail.empresa.com');
    });

    test('should accept email with numbers', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        email: 'teste123@empresa456.com',
      });

      expect(tenant.email).toBe('teste123@empresa456.com');
    });

    test('should accept email with plus sign', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        email: 'teste+tag@empresa.com',
      });

      expect(tenant.email).toBe('teste+tag@empresa.com');
    });
  });

  describe('Slug Validation', () => {
    test('should accept valid slug', () => {
      const tenant = TenantEntity.create(validTenantData);
      expect(tenant.slug).toBe('empresa-teste');
    });

    test('should reject slug with uppercase letters', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: 'Empresa-Teste',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should reject slug with spaces', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: 'empresa teste',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should reject slug with underscores', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: 'empresa_teste',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should reject slug with special characters', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: 'empresa@teste',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should reject slug starting with hyphen', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: '-empresa-teste',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should reject slug ending with hyphen', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: 'empresa-teste-',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should reject slug with consecutive hyphens', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          slug: 'empresa--teste',
        })
      ).toThrow('Slug inválido. Use apenas letras minúsculas, números e hífens');
    });

    test('should accept slug with numbers', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        slug: 'empresa-123-teste',
      });

      expect(tenant.slug).toBe('empresa-123-teste');
    });

    test('should accept slug with only numbers', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        slug: '123456',
      });

      expect(tenant.slug).toBe('123456');
    });

    test('should accept single word slug', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        slug: 'empresa',
      });

      expect(tenant.slug).toBe('empresa');
    });
  });

  describe('Phone Validation', () => {
    test('should accept valid phone without formatting', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        phone: '11999999999',
      });

      expect(tenant.phone).toBe('11999999999');
    });

    test('should accept phone with formatting (11) 99999-9999', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        phone: '(11) 99999-9999',
      });

      expect(tenant.phone).toBe('(11) 99999-9999');
    });

    test('should accept phone with formatting +55 11 99999-9999', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        phone: '+55 11 99999-9999',
      });

      expect(tenant.phone).toBe('+55 11 99999-9999');
    });

    test('should accept landline phone', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        phone: '1133334444',
      });

      expect(tenant.phone).toBe('1133334444');
    });

    test('should accept landline phone with formatting', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        phone: '(11) 3333-4444',
      });

      expect(tenant.phone).toBe('(11) 3333-4444');
    });

    test('should accept null phone', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        phone: null,
      });

      expect(tenant.phone).toBeNull();
    });

    test('should reject phone with less than 8 digits', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          phone: '1234567',
        })
      ).toThrow('Telefone inválido');
    });

    test('should reject phone with more than 11 digits', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          phone: '119999999999',
        })
      ).toThrow('Telefone inválido');
    });

    test('should reject phone with letters', () => {
      expect(() =>
        TenantEntity.create({
          ...validTenantData,
          phone: '11abc999999',
        })
      ).toThrow('Telefone inválido');
    });
  });

  describe('IsActive Property', () => {
    test('should create active tenant by default', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        isActive: true,
      });

      expect(tenant.isActive).toBe(true);
    });

    test('should create inactive tenant', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        isActive: false,
      });

      expect(tenant.isActive).toBe(false);
    });
  });

  describe('Address Property', () => {
    test('should accept valid address', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        address: 'Rua Teste, 123, São Paulo - SP',
      });

      expect(tenant.address).toBe('Rua Teste, 123, São Paulo - SP');
    });

    test('should accept null address', () => {
      const tenant = TenantEntity.create({
        ...validTenantData,
        address: null,
      });

      expect(tenant.address).toBeNull();
    });

    test('should accept long address', () => {
      const longAddress =
        'Rua Muito Longa Com Nome Extenso, 12345, Complemento Apartamento 789, Bairro Teste, Cidade - Estado, CEP 12345-678';

      const tenant = TenantEntity.create({
        ...validTenantData,
        address: longAddress,
      });

      expect(tenant.address).toBe(longAddress);
    });
  });

  describe('Getters', () => {
    test('should return all properties correctly', () => {
      const tenant = TenantEntity.create(validTenantData);

      expect(tenant.id).toBeDefined();
      expect(tenant.name).toBe(validTenantData.name);
      expect(tenant.email).toBe(validTenantData.email);
      expect(tenant.slug).toBe(validTenantData.slug);
      expect(tenant.phone).toBe(validTenantData.phone);
      expect(tenant.isActive).toBe(validTenantData.isActive);
      expect(tenant.address).toBe(validTenantData.address);
    });

    test('should return null for optional fields when not provided', () => {
      const tenant = TenantEntity.create({
        name: 'Empresa Teste',
        email: 'teste@empresa.com',
        slug: 'empresa-teste',
        isActive: true,
        password: 'Senha#123',
      });

      expect(tenant.phone).toBeNull();
      expect(tenant.address).toBeNull();
    });
  });
});
