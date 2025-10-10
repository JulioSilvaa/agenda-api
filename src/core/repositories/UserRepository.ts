import { UserEntity } from '../entities/UserEntity';

export interface IUserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string, tenantId: string): Promise<UserEntity | null>;
  findByTenantId(tenantId: string): Promise<UserEntity[]>;
  findAll(): Promise<UserEntity[]>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
