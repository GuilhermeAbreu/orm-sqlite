import type { SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface IDatabaseConnectionOrmSQLite {
  setConfig(config: Partial<IDatabaseConfig>): void;
  isOpen(): Promise<boolean>;
  createOrReconnectConnection(): Promise<SQLiteDBConnection>;
  closeDB(): Promise<void>;
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  execute<T = any>(sql: string): Promise<IReturnExecuteQuery<T>>;
  executeWithParams<T = any>(sql: string, params: any[]): Promise<IReturnExecuteQuery<T>>;
  executeTransaction<T = any>(work: () => Promise<T>): Promise<T>;
  query<T = any>(sql: string): Promise<T[]>;
  queryWithParams<T = any>(sql: string, params: any[]): Promise<T[]>;
  queryOneWithParams<T = any>(sql: string, params: any[]): Promise<T | null>;
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

export interface IReturnExecuteQuery<T> {
  changes: number,
  hasChanged: boolean,
  values: T[],
  changedValues: T[]
}
