import TenantAdapter, { TenantRow } from '../../../adapters/TenantAdapter';
import { TenantEntity } from '../../../core/entities/TenantEntity';
import { ITenantRepository } from '../../../core/repositories/TenantRepository';
import { getSqliteClient } from '../../db/sqliteClient';

export class TenantRepositorySqlite implements ITenantRepository {
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.createTableIfNotExists();
  }

  private async ready() {
    await this.initPromise;
    return getSqliteClient();
  }

  private async createTableIfNotExists() {
    const db = await getSqliteClient();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        isActive INTEGER NOT NULL,
        address TEXT,
        password TEXT NOT NULL
      );
    `);
  }

  private rowToEntity(row: TenantRow): TenantEntity {
    return TenantAdapter.fromRow(row);
  }

  async create(tenant: TenantEntity): Promise<TenantEntity> {
    const db = await this.ready();
    const p = TenantAdapter.toPersistence(tenant);
    await db.run(
      `INSERT INTO tenants (id, name, slug, email, phone, isActive, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.slug, p.email, p.phone, p.isActive, p.address, p.password]
    );
    return tenant;
  }

  async findByEmail(email: string): Promise<TenantEntity | null> {
    const db = await this.ready();
    const row = await db.get('SELECT * FROM tenants WHERE email = ?', [email]);
    return row ? this.rowToEntity(row) : null;
  }

  async delete(id: string): Promise<void> {
    const db = await this.ready();
    await db.run('DELETE FROM tenants WHERE id = ?', [id]);
  }

  async update(tenant: TenantEntity): Promise<TenantEntity> {
    const db = await this.ready();
    const p = TenantAdapter.toPersistence(tenant);
    const result = await db.run(
      `UPDATE tenants SET name = ?, slug = ?, email = ?, phone = ?, isActive = ?, address = ?, password = ? WHERE id = ?`,
      [p.name, p.slug, p.email, p.phone, p.isActive, p.address, p.password, p.id]
    );
    if (result.changes === 0) throw new Error('Tenant não encontrado');
    return tenant;
  }

  async findById(id: string): Promise<TenantEntity | null> {
    const db = await this.ready();
    const row = await db.get('SELECT * FROM tenants WHERE id = ?', [id]);
    return row ? this.rowToEntity(row) : null;
  }
}
