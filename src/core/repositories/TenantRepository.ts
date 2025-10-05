import { TenantEntity } from "../entities/TenantEntity";

export interface ITenantRepository {
  create(tenant: TenantEntity): Promise<TenantEntity>;
  findByEmail(email: string): Promise<TenantEntity | null>;
<<<<<<< HEAD
=======
  delete(id: string): Promise<void>;
  update(tenant: TenantEntity): Promise<TenantEntity>;
>>>>>>> 2e0b63285ebb1ae2c689f88422ff87c08feee2c3
  findById(id: string): Promise<TenantEntity | null>;
}
