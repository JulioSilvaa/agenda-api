import TenantAdapter from '../../../adapters/TenantAdapter';
import { TenantEntity } from '../../../core/entities/TenantEntity';
import { ITenantRepository } from '../../../core/repositories/TenantRepository';
import prisma from '../../db/prismaClient';

export class TenantRepositorySQL implements ITenantRepository {
  async create(tenant: TenantEntity): Promise<TenantEntity> {
    const data = TenantAdapter.toDb(tenant) as any;
    const row = await prisma.tenant.create({ data });

    return new TenantEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone ?? null,
      isActive: row.isActive,
      address: row.address ?? null,
      password: row.password,
    });
  }

  async findByEmail(email: string): Promise<TenantEntity | null> {
    if (!email) return null;
    const row = await prisma.tenant.findUnique({ where: { email } });
    if (!row) return null;
    return new TenantEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone ?? null,
      isActive: row.isActive,
      address: row.address ?? null,
      password: row.password,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.tenant.delete({ where: { id } });
  }

  async update(tenant: TenantEntity): Promise<TenantEntity> {
    const data = TenantAdapter.toDb(tenant) as any;
    const row = await prisma.tenant.update({
      where: { id: tenant.id! },
      data,
    });

    return new TenantEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone ?? null,
      isActive: row.isActive,
      address: row.address ?? null,
      password: row.password,
    });
  }

  async findById(id: string): Promise<TenantEntity | null> {
    const row = await prisma.tenant.findUnique({ where: { id } });
    if (!row) return null;
    return new TenantEntity({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone ?? null,
      isActive: row.isActive,
      address: row.address ?? null,
      password: row.password,
    });
  }
}

export default TenantRepositorySQL;
