import { UserEntity } from '../../../core/entities/UserEntity';
import { IUserRepository } from '../../../core/repositories/UserRepository';

export class UserRepositoryInMemory implements IUserRepository {
  private users: UserEntity[] = [];

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
    const user = this.users.find(u => u.email === email && u.tenantId === tenantId);
    return user ? user : null;
  }

  async findByTenantId(tenantId: string): Promise<UserEntity[]> {
    return this.users.filter(u => u.tenantId === tenantId);
  }
}
