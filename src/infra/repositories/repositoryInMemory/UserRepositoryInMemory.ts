import { UserEntity } from '../../../core/entities/UserEntity';
import { IUserRepository } from '../../../core/repositories/UserRepository';

export class UserRepositoryInMemory implements IUserRepository {
  private users: UserEntity[] = [];

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
    const user = this.users.find(u => u.email === email && u.tenantId === tenantId);
    return user ? user : null;
  }

  async findByTenantId(tenantId: string): Promise<UserEntity[]> {
    return this.users.filter(u => u.tenantId === tenantId);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.users;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }
    this.users[index] = user;
    return user;
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }
    this.users = this.users.filter(u => u.id !== id);
  }
}
