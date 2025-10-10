import { UserEntity } from '../core/entities/UserEntity';
import { IUser } from '../core/interfaces/User';

export default class UserAdapter {
  static create({
    id,
    tenantId,
    name,
    email,
    password,
    role,
    isActive,
    createdAt,
    updatedAt,
  }: IUser) {
    return new UserEntity({
      id,
      tenantId,
      name,
      email,
      password,
      role,
      isActive,
      createdAt,
      updatedAt,
    });
  }
}
