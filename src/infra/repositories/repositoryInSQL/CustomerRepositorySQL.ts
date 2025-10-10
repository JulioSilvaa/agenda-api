import CustomerAdapter from '../../../adapters/CustomerAdapter';
import { CustomerEntity } from '../../../core/entities/CustomerEntity';
import { ICustomerRepository } from '../../../core/repositories/CustomerRepository';
import prisma from '../../db/prismaClient';

export class CustomerRepositorySQL implements ICustomerRepository {
  async findAll(): Promise<CustomerEntity[]> {
    const rows = await prisma.customer.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(row =>
      CustomerAdapter.create({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        email: row.email ?? undefined,
        phone: row.phone,
        isActive: row.isActive,
        totalBookings: row.totalBookings,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      } as any)
    );
  }

  async create(customer: CustomerEntity): Promise<CustomerEntity> {
    const row = await prisma.customer.create({
      data: {
        id: customer.id,
        tenantId: customer.tenantId,
        name: customer.name,
        email: customer.email ?? undefined,
        phone: customer.phone,
        isActive: customer.isActive,
        totalBookings: customer.totalBookings,
      },
    });
    return CustomerAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      isActive: row.isActive,
      totalBookings: row.totalBookings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async update(customer: CustomerEntity): Promise<CustomerEntity> {
    const row = await prisma.customer.update({
      where: { id: customer.id! },
      data: {
        name: customer.name,
        email: customer.email ?? undefined,
        phone: customer.phone,
        isActive: customer.isActive,
        totalBookings: customer.totalBookings,
      },
    });
    return CustomerAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      isActive: row.isActive,
      totalBookings: row.totalBookings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async delete(id: string): Promise<void> {
    await prisma.customer.delete({ where: { id } });
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    const row = await prisma.customer.findUnique({ where: { id } });
    if (!row) return null;
    return CustomerAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      isActive: row.isActive,
      totalBookings: row.totalBookings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async findByTenantId(tenantId: string): Promise<CustomerEntity[]> {
    if (!tenantId) return [];
    const rows = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(row =>
      CustomerAdapter.create({
        id: row.id,
        tenantId: row.tenantId,
        name: row.name,
        email: row.email ?? undefined,
        phone: row.phone,
        isActive: row.isActive,
        totalBookings: row.totalBookings,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      } as any)
    );
  }

  async findByEmail(email: string, tenantId: string): Promise<CustomerEntity | null> {
    if (!email || !tenantId) return null;
    const row = await prisma.customer.findFirst({ where: { email, tenantId } });
    if (!row) return null;
    return CustomerAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      isActive: row.isActive,
      totalBookings: row.totalBookings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }

  async findByPhone(phone: string, tenantId: string): Promise<CustomerEntity | null> {
    if (!phone || !tenantId) return null;
    const row = await prisma.customer.findFirst({ where: { phone, tenantId } });
    if (!row) return null;
    return CustomerAdapter.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      isActive: row.isActive,
      totalBookings: row.totalBookings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as any);
  }
}

export default CustomerRepositorySQL;
