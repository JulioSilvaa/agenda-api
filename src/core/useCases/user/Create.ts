import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { UserEntity } from '../../entities/UserEntity';
import { IUser } from '../../interfaces/User';
import { ITenantRepository } from '../../repositories/TenantRepository';
import { IUserRepository } from '../../repositories/UserRepository';

export class CreateUser {
  private readonly userRepository: IUserRepository;
  private readonly tenantRepository: ITenantRepository;

  constructor(userRepository: IUserRepository, tenantRepository: ITenantRepository) {
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    // Validar se o tenant existe
    const tenantExists = await this.tenantRepository.findById(data.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant não encontrado');
    }

    // Validar se já existe um usuário com o mesmo email no tenant
    const existingUser = await this.userRepository.findByEmail(data.email, data.tenantId);
    if (existingUser) {
      throw new Error('Já existe um usuário com este email neste tenant');
    }

    // Validar senha antes de hashear
    if (!data.password || data.password.trim().length === 0) {
      throw new Error('Senha é obrigatória');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário com senha hasheada
    const userData: IUser = {
      ...data,
      password: hashedPassword,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = UserEntity.create(userData);
    return await this.userRepository.create(user);
  }
}
