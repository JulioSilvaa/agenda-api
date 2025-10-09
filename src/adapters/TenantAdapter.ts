import { TenantEntity } from '../core/entities/TenantEntity';

export default class TenantAdapter {
  static create(entity: TenantEntity) {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      email: entity.email,
      phone: entity.phone,
      isActive: entity.isActive ? 1 : 0,
      address: entity.address,
      password: entity.password,
    };
  }
}
