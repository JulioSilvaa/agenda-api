import CustomerAdapter, { CustomerRow } from '../../../adapters/CustomerAdapter';
import { CustomerEntity } from '../../../core/entities/CustomerEntity';
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

  private toEntity(row: CustomerRow): CustomerEntity {
    return CustomerAdapter.create(row);
  }

  private async ready() {
    await this.initPromise;
    return getSqliteClient();
  }

  async findAll(): Promise<CustomerEntity[]> {
    const db = await this.ready();
    const rows = await db.all('SELECT * FROM customers');
    return rows.map((r: CustomerRow) => this.toEntity(r));
  }

  async create(customer: CustomerEntity): Promise<CustomerEntity> {
    const db = await this.ready();
    const p = CustomerAdapter.toPersistence(customer);
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
    const row = await db.get('SELECT * FROM customers WHERE id = ?', [p.id]);
    return this.toEntity(row);
  }

  async update(customer: CustomerEntity): Promise<CustomerEntity> {
    const db = await this.ready();
    const p = CustomerAdapter.toPersistence(customer);
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
    const row = await db.get('SELECT * FROM customers WHERE id = ?', [p.id]);
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    const db = await this.ready();
    await db.run('DELETE FROM customers WHERE id = ?', [id]);
  }

  async findById(id: string): Promise<CustomerEntity | null> {
    const db = await this.ready();
    const row = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    return row ? this.toEntity(row) : null;
  }

  async findByTenantId(tenantId: string): Promise<CustomerEntity[]> {
    const db = await this.ready();
    const rows = await db.all('SELECT * FROM customers WHERE tenantId = ?', [tenantId]);
    return rows.map((r: CustomerRow) => this.toEntity(r));
  }

  async findByEmail(email: string, tenantId: string): Promise<CustomerEntity | null> {
    const db = await this.ready();
    const row = await db.get('SELECT * FROM customers WHERE email = ? AND tenantId = ?', [
      email,
      tenantId,
    ]);
    return row ? this.toEntity(row) : null;
  }

  async findByPhone(phone: string, tenantId: string): Promise<CustomerEntity | null> {
    const db = await this.ready();
    const row = await db.get('SELECT * FROM customers WHERE phone = ? AND tenantId = ?', [
      phone,
      tenantId,
    ]);
    return row ? this.toEntity(row) : null;
  }
}
