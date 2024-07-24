import type { SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface IDatabaseConnectionOrmSQLite {  
    isOpen(): Promise<boolean>;
    createOrReconnectConnection(forceCreate: boolean): Promise<SQLiteDBConnection>;
    closeDB(): Promise<void>;
    beginTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;
    rollbackTransaction(): Promise<void>;
    execute(sql: string): Promise<boolean>;
    query<T = any>(sql: string): Promise<T[]>;
    getCurrentDBVersion(): Promise<number | undefined>;
    updateDBVersion(newVersion: number): Promise<void>;
    recreateDatabase(migration: any[]): Promise<void>;
    runMigrationsIfNeeded(migrations: any[]): Promise<void>;
  }

  export interface IMigrationDatabaseOrmSQLite {
    version: number,
    sql: string[]
  }