import { UserEntity } from '../entities/UserEntity';

export interface IUserRepository {
  create(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string, tenantId: string): Promise<UserEntity | null>;
  findByTenantId(tenantId: string): Promise<UserEntity[]>;
}
