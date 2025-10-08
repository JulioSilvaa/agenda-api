import path from 'path';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

sqlite3.verbose();

let dbPromise: Promise<Database> | null = null;

export function getSqliteClient(): Promise<Database> {
  if (dbPromise) return dbPromise;
  const dbPath = process.env.SQLITE_DB_PATH || ':memory:';
  const filename = dbPath === ':memory:' ? dbPath : path.resolve(dbPath);
  dbPromise = open({ filename, driver: sqlite3.Database });
  return dbPromise;
}
