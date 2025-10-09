import CustomerAdapter from '../../../adapters/CustomerAdapter';
import { CustomerEntity } from '../../../core/entities/CustomerEntity';
import type { ICustomer } from '../../../core/interfaces/Customer';
import { ICustomerRepository } from '../../../core/repositories/CustomerRepository';
import { getSqliteClient } from '../../db/sqliteClient';

export class CustomerRepositorySqlite implements ICustomerRepository {
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.createTableIfNotExists();
  }

  private async createTableIfNotExists() {
    const db = await getSqliteClient();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        isActive INTEGER NOT NULL,
        totalBookings INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }

  private async ready() {
    await this.initPromise;
    return getSqliteClient();
  }

  // Tipagem do registro retornado pelo SQLite
  private mapRow(row: DbCustomerRow): CustomerEntity {
    const adapted = {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email ?? undefined,
      phone: row.phone,
      isActive: row.isActive,
      totalBookings: row.totalBookings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as const;
    // O adapter aceita strings de data e converte internamente; usamos 'unknown' para evitar 'any'
    return CustomerAdapter.create(adapted as unknown as ICustomer);
  }

  // Representação da linha vinda do SQLite
  private declareRowType(_: DbCustomerRow) {}

  async findAll(): Promise<CustomerEntity[]> {
    const db = await this.ready();
    const rows = (await db.all('SELECT * FROM customers')) as DbCustomerRow[];
    return rows.map(r => this.mapRow(r));
  }

  async create(customer: CustomerEntity): Promise<CustomerEntity> {
    const db = await this.ready();
    const p = {
      id: customer.id,
      tenantId: customer.tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isActive: customer.isActive ? 1 : 0,
      totalBookings: customer.totalBookings,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    } as const;
    await db.run(
      `INSERT INTO customers (id, tenantId, name, email, phone, isActive, totalBookings, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.tenantId,
        p.name,
        p.email,
        p.phone,
        p.isActive,
        p.totalBookings,
        p.createdAt,
        p.updatedAt,
      ]
    );
    const row = (await db.get('SELECT * FROM customers WHERE id = ?', [p.id])) as
      | DbCustomerRow
      | undefined;
    return row ? this.mapRow(row) : customer;
  }

  async update(customer: CustomerEntity): Promise<CustomerEntity> {
    const db = await this.ready();
    const p = {
      id: customer.id,
      tenantId: customer.tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isActive: customer.isActive ? 1 : 0,
      totalBookings: customer.totalBookings,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    } as const;
    const result = await db.run(
      `UPDATE customers SET tenantId = ?, name = ?, email = ?, phone = ?, isActive = ?, totalBookings = ?, createdAt = ?, updatedAt = ? WHERE id = ?`,
      [
        p.tenantId,
        p.name,
        p.email,
        p.phone,
        p.isActive,
        p.totalBookings,
        p.createdAt,
        p.updatedAt,
        p.id,
      ]
    );
    if (result.changes === 0) throw new Error('Cliente não encontrado');
    const row = (await db.get('SELECT * FROM customers WHERE id = ?', [p.id])) as
      | DbCustomerRow
      | undefined;
    return row ? this.mapRow(row) : customer;
  }

  async delete(id: string): Promise<void> {
    const db = await this.ready();
    await db.run('DELETE FROM customers WHERE id = ?', [id]);
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    const db = await this.ready();
    const row = (await db.get('SELECT * FROM customers WHERE id = ?', [id])) as
      | DbCustomerRow
      | undefined;
    return row ? this.mapRow(row) : null;
  }

  async findByTenantId(tenantId: string): Promise<CustomerEntity[]> {
    const db = await this.ready();
    const rows = (await db.all('SELECT * FROM customers WHERE tenantId = ?', [
      tenantId,
    ])) as DbCustomerRow[];
    return rows.map(r => this.mapRow(r));
  }

  async findByEmail(email: string, tenantId: string): Promise<CustomerEntity | null> {
    const db = await this.ready();
    const row = (await db.get('SELECT * FROM customers WHERE email = ? AND tenantId = ?', [
      email,
      tenantId,
    ])) as DbCustomerRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  async findByPhone(phone: string, tenantId: string): Promise<CustomerEntity | null> {
    const db = await this.ready();
    const row = (await db.get('SELECT * FROM customers WHERE phone = ? AND tenantId = ?', [
      phone,
      tenantId,
    ])) as DbCustomerRow | undefined;
    return row ? this.mapRow(row) : null;
  }
}

// Tipos auxiliares
type DbCustomerRow = {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string;
  isActive: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
};
