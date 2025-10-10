import ServiceAdapter from '../../../adapters/ServiceAdapter';
import { ServiceEntity } from '../../../core/entities/ServiceEntity';
import { IServiceRepository } from '../../../core/repositories/ServiceRepository';
import prisma from '../../db/prismaClient';

export class ServiceRepositorySQL implements IServiceRepository {
  async create(service: ServiceEntity): Promise<ServiceEntity> {
    const data = ServiceAdapter.toDb(service) as any;
    const row = await prisma.service.create({ data });
    return ServiceAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async update(service: ServiceEntity): Promise<ServiceEntity> {
    const data = ServiceAdapter.toDb(service) as any;
    const row = await prisma.service.update({
      where: { id: service.id! },
      data,
    });
    return ServiceAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async delete(id: string): Promise<void> {
    await prisma.service.delete({ where: { id } });
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const row = await prisma.service.findUnique({ where: { id } });
    if (!row) return null;
    return ServiceAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async findAll(): Promise<ServiceEntity[]> {
    const rows = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(row =>
      ServiceAdapter.create({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        description: row.description ?? undefined,
        price: Number(row.price),
        durationMinutes: row.durationMinutes,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      } as any)
    );
  }

  async findByName(name: string, tenantId: string): Promise<ServiceEntity | null> {
    if (!name || !tenantId) return null;
    const row = await prisma.service.findFirst({ where: { name, tenantId } });
    if (!row) return null;
    return ServiceAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      price: Number(row.price),
      durationMinutes: row.durationMinutes,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }
}

export default ServiceRepositorySQL;
