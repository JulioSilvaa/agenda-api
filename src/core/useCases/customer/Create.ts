import { CustomerEntity } from '../../entities/CustomerEntity';
import { ICustomer } from '../../interfaces/Customer';
import { ICustomerRepository } from '../../repositories/CustomerRepository';
import { ITenantRepository } from '../../repositories/TenantRepository';

export class CreateCustomer {
  private readonly customerRepository: ICustomerRepository;
  private readonly tenantRepository: ITenantRepository;

  constructor(customerRepository: ICustomerRepository, tenantRepository: ITenantRepository) {
    this.customerRepository = customerRepository;
    this.tenantRepository = tenantRepository;
  }

  async execute(data: Omit<ICustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerEntity> {
    // Validar se o tenant existe
    const tenantExists = await this.tenantRepository.findById(data.tenantId);
    if (!tenantExists) {
      throw new Error('Tenant não encontrado');
    }

    // Validar se já existe um cliente com o mesmo email no tenant
    const existingCustomerByEmail = await this.customerRepository.findByEmail(data.email, data.tenantId);
    if (existingCustomerByEmail) {
      throw new Error('Já existe um cliente com este email neste tenant');
    }

    // Validar se já existe um cliente com o mesmo telefone no tenant
    const existingCustomerByPhone = await this.customerRepository.findByPhone(data.phone, data.tenantId);
    if (existingCustomerByPhone) {
      throw new Error('Já existe um cliente com este telefone neste tenant');
    }

    // Criar cliente
    const customerData: ICustomer = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customer = CustomerEntity.create(customerData);
    return await this.customerRepository.create(customer);
  }
}
