import { CustomerEntity } from '../../entities/CustomerEntity';
import { ICustomerRepository } from '../../repositories/CustomerRepository';

export default class FindCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(
    tenantId: string,
    options?: { onlyActive?: boolean; sortBy?: string; search?: string }
  ): Promise<CustomerEntity[]> {
    let customers = await this.customerRepository.findByTenantId(tenantId);

    if (options?.onlyActive) {
      customers = customers.filter(c => c.isActive);
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          (c.email && c.email.toLowerCase().includes(searchLower))
      );
    }

    if (options?.sortBy === 'name') {
      customers = customers.sort((a, b) => a.name.localeCompare(b.name));
    }

    return customers;
  }
}
