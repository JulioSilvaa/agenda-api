import { UserEntity } from '../core/entities/UserEntity';
import { IUser } from '../core/interfaces/User';

export default class UserAdapter {
  static create(row: IUser): UserEntity {
    if (!row) throw new Error('Dados inválidos para criação de UserEntity');

    return new UserEntity({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }

  static toDb(entity: UserEntity): Partial<IUser> {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      role: entity.role,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
