import { CustomerEntity } from '../core/entities/CustomerEntity';
import { ICustomer } from '../core/interfaces/Customer';

export default class CustomerAdapter {
  static create(row: ICustomer): CustomerEntity {
    if (!row) throw new Error('Row inválido para criação de CustomerEntity');
    return CustomerEntity.create({
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email === null ? undefined : row.email,
      phone: row.phone,
      isActive: row.isActive === undefined ? true : !!row.isActive,
      totalBookings: row.totalBookings ?? 0,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    });
  }
}
