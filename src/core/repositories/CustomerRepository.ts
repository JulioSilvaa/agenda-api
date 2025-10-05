import { CustomerEntity } from '../entities/CustomerEntity';

export interface ICustomerRepository {
  create(customer: CustomerEntity): Promise<CustomerEntity>;
  update(customer: CustomerEntity): Promise<CustomerEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<CustomerEntity | null>;
  findByTenantId(tenantId: string): Promise<CustomerEntity[]>;
  findByEmail(email: string, tenantId: string): Promise<CustomerEntity | null>;
  findByPhone(phone: string, tenantId: string): Promise<CustomerEntity | null>;
}
