import { CustomerEntity } from '../../../core/entities/CustomerEntity';
import { ICustomerRepository } from '../../../core/repositories/CustomerRepository';

export class CustomerRepositoryInMemory implements ICustomerRepository {
  private customers: CustomerEntity[] = [];

  async create(customer: CustomerEntity): Promise<CustomerEntity> {
    this.customers.push(customer);
    return customer;
  }

  async update(customer: CustomerEntity): Promise<CustomerEntity> {
    const index = this.customers.findIndex(c => c.id === customer.id);
    if (index === -1) {
      throw new Error('Cliente não encontrado');
    }
    this.customers[index] = customer;
    return customer;
  }

  async delete(id: string): Promise<void> {
    this.customers = this.customers.filter(c => c.id !== id);
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    const customer = this.customers.find(c => c.id === id);
    return customer ? customer : null;
  }

  async findByTenantId(tenantId: string): Promise<CustomerEntity[]> {
    return this.customers.filter(c => c.tenantId === tenantId);
  }

  async findByEmail(email: string, tenantId: string): Promise<CustomerEntity | null> {
    const customer = this.customers.find(c => c.email === email && c.tenantId === tenantId);
    return customer ? customer : null;
  }

  async findByPhone(phone: string, tenantId: string): Promise<CustomerEntity | null> {
    const customer = this.customers.find(c => c.phone === phone && c.tenantId === tenantId);
    return customer ? customer : null;
  }
}
