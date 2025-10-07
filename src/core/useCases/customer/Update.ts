import { CustomerEntity } from '../../entities/CustomerEntity';
import { ICustomerRepository } from '../../repositories/CustomerRepository';

export default class UpdateCustomer {
  constructor(private customerRepository: ICustomerRepository) {
    this.customerRepository = customerRepository;
  }
  async execute(customer: CustomerEntity): Promise<CustomerEntity> {
    const existingCustomer = await this.customerRepository.findById(customer.id!);
    if (!existingCustomer) {
      throw new Error('Cliente não encontrado');
    }

    // Validação de tenant
    if (existingCustomer.tenantId !== customer.tenantId) {
      throw new Error('Cliente não pertence a este tenant');
    }

    // Validação de email duplicado (permitido se for o mesmo cliente)
    if (customer.email) {
      const emailCustomer = await this.customerRepository.findByEmail(
        customer.email,
        customer.tenantId
      );
      if (emailCustomer && emailCustomer.id !== customer.id) {
        throw new Error('Já existe um cliente com este email neste tenant');
      }
    }

    // Validação de telefone duplicado (permitido se for o mesmo cliente)
    if (customer.phone) {
      const phoneCustomer = await this.customerRepository.findByPhone(
        customer.phone,
        customer.tenantId
      );
      if (phoneCustomer && phoneCustomer.id !== customer.id) {
        throw new Error('Já existe um cliente com este telefone neste tenant');
      }
    }

    // O CustomerEntity já valida os dados no construtor, então não é necessário recriar aqui.

    const updatedCustomer = await this.customerRepository.update(customer);
    if (!updatedCustomer) {
      throw new Error('Falha ao atualizar cliente.');
    }
    return updatedCustomer;
  }
}
