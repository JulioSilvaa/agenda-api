import { ICustomerRepository } from '../../repositories/CustomerRepository';

export class DeleteCustomer {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(customerId: string, tenantId: string): Promise<void> {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    if (customer.tenantId !== tenantId) {
      throw new Error('Cliente não pertence a este tenant');
    }

    await this.customerRepository.delete(customerId);
  }
}
