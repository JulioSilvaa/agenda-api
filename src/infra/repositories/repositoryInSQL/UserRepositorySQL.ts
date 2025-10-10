import UserAdapter from '../../../adapters/UserAdapter';
import { UserEntity } from '../../../core/entities/UserEntity';
import { IUserRepository } from '../../../core/repositories/UserRepository';
import prisma from '../../db/prismaClient';

export class UserRepositorySQL implements IUserRepository {
  async create(user: UserEntity): Promise<UserEntity> {
    const row = await prisma.user.create({
      data: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as any,
        isActive: user.isActive,
      },
    });
    return UserAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as any,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return UserAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as any,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
    if (!email || !tenantId) return null;
    const row = await prisma.user.findFirst({ where: { email, tenantId } });
    if (!row) return null;
    return UserAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as any,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async findByTenantId(tenantId: string): Promise<UserEntity[]> {
    if (!tenantId) return [];
    const rows = await prisma.user.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    return rows.map(row =>
      UserAdapter.create({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role as any,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  async findAll(): Promise<UserEntity[]> {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(row =>
      UserAdapter.create({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role as any,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const row = await prisma.user.update({
      where: { id: user.id! },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as any,
        isActive: user.isActive,
      },
    });
    return UserAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as any,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
