import type { SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface IDatabaseConnectionOrmSQLite {
  setConfig(config: Partial<IDatabaseConfig>): void;
  isOpen(): Promise<boolean>;
  createOrReconnectConnection(): Promise<SQLiteDBConnection>;
  closeDB(): Promise<void>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  execute(sql: string): Promise<boolean>;
  query<T = any>(sql: string): Promise<T[]>;
  getCurrentDBVersion(): Promise<number | undefined>;
  updateDBVersion(newVersion: number): Promise<void>;
  recreateDatabase(migration: IMigrationDatabaseOrmSQLite[]): Promise<void>;
  runMigrationsIfNeeded(migrations: IMigrationDatabaseOrmSQLite[]): Promise<void>;
}
export interface IDatabaseConfig {
  database: string;
  encrypted: boolean;
  mode: string;
  version: number;
  readonly: boolean;
  log: boolean;
}
export interface IMigrationDatabaseOrmSQLite {
  version: number,
  sql: string[]
}