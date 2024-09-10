import type { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

import type { IDatabaseConfig, IDatabaseConnectionOrmSQLite, IMigrationDatabaseOrmSQLite } from './database.definitions';

export class DatabaseConnectionOrmSQlite implements IDatabaseConnectionOrmSQLite {

  protected static sqlite: SQLiteConnection;
  private static _DB: SQLiteDBConnection | undefined;
  private static isModoTransaction: boolean = false;

  private static config = {
    database: '',
    encrypted: false,
    mode: '',
    version: 1,
    readonly: false,
    log: false,
  };

  constructor(
    SQLiteConnection: SQLiteConnection,
    database: string,
    encrypted: boolean,
    mode: string,
    version: number,
    readonly: boolean,
    log: boolean
  ) {
    DatabaseConnectionOrmSQlite.sqlite = SQLiteConnection;
    DatabaseConnectionOrmSQlite.config.database = database;
    DatabaseConnectionOrmSQlite.config.encrypted = encrypted;
    DatabaseConnectionOrmSQlite.config.mode = mode;
    DatabaseConnectionOrmSQlite.config.version = version;
    DatabaseConnectionOrmSQlite.config.readonly = readonly;
    DatabaseConnectionOrmSQlite.config.log = log;
  }

  static get database(): string {
    return this.config.database;
  }
  static get encrypted(): boolean {
    return this.config.encrypted;
  }
  static get mode(): string {
    return this.config.mode;
  }
  static get version(): number {
    return this.config.version;
  }
  static get readonly(): boolean {
    return this.config.readonly;
  }
  static get log(): boolean {
    return this.config.log;
  }

  setConfig(config: Partial<IDatabaseConfig>): void {
    config;
    throw new Error('This method is not an instance method, use the static method');
  }

  public static setConfig(config: Partial<typeof DatabaseConnectionOrmSQlite.config>): void {
    DatabaseConnectionOrmSQlite.config = { ...DatabaseConnectionOrmSQlite.config, ...config };
    DatabaseConnectionOrmSQlite._DB = undefined;  // Reset DB connection to force reinitialization with new config
  }

  isOpen(): Promise<boolean> {
    throw new Error('This method is not an instance method, use the static method');
  }
  createOrReconnectConnection(): Promise<SQLiteDBConnection> {
    throw new Error('This method is not an instance method, use the static method');
  }
  closeDB(): Promise<void> {
    throw new Error('This method is not an instance method, use the static method');
  }
  beginTransaction(): Promise<void> {
    throw new Error('This method is not an instance method, use the static method');
  }
  commitTransaction(): Promise<void> {
    throw new Error('This method is not an instance method, use the static method');
  }
  rollbackTransaction(): Promise<void> {
    throw new Error('This method is not an instance method, use the static method');
  }
  execute(sql: string): Promise<boolean> {
    sql;
    throw new Error('This method is not an instance method, use the static method');
  }
  query<T = any>(sql: string): Promise<T[]> {
    sql;
    throw new Error('This method is not an instance method, use the static method');
  }
  getCurrentDBVersion(): Promise<number | undefined> {
    throw new Error('This method is not an instance method, use the static method');
  }
  updateDBVersion(newVersion: number): Promise<void> {
    newVersion;
    throw new Error('This method is not an instance method, use the static method');
  }
  recreateDatabase(migration: any[]): Promise<void> {
    migration;
    throw new Error('This method is not an instance method, use the static method');
  }
  runMigrationsIfNeeded(migrations: any[]): Promise<void> {
    migrations;
    throw new Error('This method is not an instance method, use the static method');
  }

  static get db(): Promise<SQLiteDBConnection> {
    return new Promise((res, rej) => {
      try {
        res(this.initializeDB())
      } catch (error) {
        rej(error);
      }
    });
  }

  public static async isOpen(): Promise<boolean> {
    if (!DatabaseConnectionOrmSQlite._DB) return false;
    return (await DatabaseConnectionOrmSQlite._DB.isDBOpen()).result ?? false;
  }

  public static async createOrReconnectConnection(): Promise<SQLiteDBConnection> {
    const dbName = this.config.database;
    try {
      // Check connections consistency
      const isConsistent = (await this.sqlite.checkConnectionsConsistency())?.result;
      if (!isConsistent) {
        console.debug(`Inconsistent connections detected. Creating new connection to database ${dbName}`);
        return await this.sqlite.createConnection(
          dbName,
          this.config.encrypted,
          this.config.mode,
          this.config.version,
          this.config.readonly
        );
      }
  
      // Try to retrieve existing connection
      let connection: SQLiteDBConnection | null = null;
      try {
        connection = await this.sqlite.retrieveConnection(dbName, this.config.readonly);
        console.debug(`Reconnected to existing database ${dbName}`);
      } catch (retrieveError) {
        console.debug(`No existing connection found for database ${dbName}. Creating new connection.`);
      }
  
      // If no existing connection, create a new one
      if (!connection) {
        connection = await this.sqlite.createConnection(
          dbName,
          this.config.encrypted,
          this.config.mode,
          this.config.version,
          this.config.readonly
        );
        console.debug(`Created new connection to database ${dbName}`);
      }
  
      return connection;
    } catch (error) {
      console.error(`Error creating or reconnecting to database ${dbName}:`, error);
      throw error;
    }
  }
  

  public static async closeDB(): Promise<void> {
    if (DatabaseConnectionOrmSQlite._DB) {
      await DatabaseConnectionOrmSQlite._DB.close();
      DatabaseConnectionOrmSQlite._DB = undefined;
    }
  }

  public static async beginTransaction(): Promise<void> {
    const db = await this.db;
    if ((await db.isTransactionActive()).result) {
      console.warn('Transaction already active. Skipping start.');
      return;
    }
    console.debug('Starting transaction.');
    await db.beginTransaction();
    this.isModoTransaction = true;
  }

  public static async commitTransaction(): Promise<void> {
    const db = await this.db;
    await db.commitTransaction();
    this.isModoTransaction = false;
  }

  public static async rollbackTransaction(): Promise<void> {
    const db = await this.db;
    await db.rollbackTransaction();
    this.isModoTransaction = false;
  }

  public static async execute<T = any>(sql: string): Promise<T[]> {    
    if (this.config.log) {
      console.debug(this.config.database, ' | SQL: ' ,sql);
    }

    if (['', undefined, null].includes(sql.trim())) {
      throw 'The sql passed in the parameter is empty';
    }

    const db = await this.db;
    const result = await db.run(sql, undefined, this.isModoTransaction, 'all');
    return result.changes?.values ?? [];
  }

  public static async query<T = any>(sql: string): Promise<T[]> {
    if (this.config.log) {
      console.debug(this.config.database, ' | SQL: ' ,sql);
    }

    if (['', undefined, null].includes(sql.trim())) {
      throw 'The sql passed in the parameter is empty';
    }

    const db = await this.db;
    const result: any = await db.query(sql);
    return result.values?.map((row: any) => this.parseRow(row)) ?? [];
  }

  public static async getCurrentDBVersion(): Promise<number | undefined> {
    const result = await this.query<{version: number}>(`
        SELECT version FROM db_version
        ORDER BY id DESC LIMIT 1;
      `);
    return result[0]?.version;
  }

  public static async updateDBVersion(newVersion: number): Promise<void> {
    await this.execute(`
        INSERT INTO db_version (version) VALUES (${newVersion});
      `);
  }

  public static async recreateDatabase(migration: IMigrationDatabaseOrmSQLite[]): Promise<void> {
    await CapacitorSQLite.deleteDatabase({ database: this.config.database });
    this.setConfig(this.config);
    await this.runMigrationsIfNeeded(migration);
  }

  public static async runMigrationsIfNeeded(migrations: IMigrationDatabaseOrmSQLite[]): Promise<void> {
    console.debug(this.config.database, 'Checking if migrations are needed.');
    await this.createDBVersionTableIfNotExists();

    const currentVersion = await this.getCurrentDBVersion();

    if (currentVersion === undefined) {
      console.debug(this.config.database, 'Initial migration required.');
      await this.runInitialMigrations(migrations);
      return;
    }
    
    await this.migrateIfNeeded(migrations, currentVersion);
  }

  private static async initializeDB(): Promise<SQLiteDBConnection> {
    if (!DatabaseConnectionOrmSQlite._DB) {
      DatabaseConnectionOrmSQlite._DB = await this.createOrReconnectConnection();
      if (!(await DatabaseConnectionOrmSQlite._DB.isDBOpen()).result) {
        await DatabaseConnectionOrmSQlite._DB.open();
      }
    }
    return DatabaseConnectionOrmSQlite._DB;
  }

  private static async createDBVersionTableIfNotExists(): Promise<void> {
    const query = `
        CREATE TABLE IF NOT EXISTS db_version (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL
        );
      `;
    await this.execute(query);
  }

  private static async runInitialMigrations(migrations: any[]): Promise<void> {
    for (const migration of migrations) {
      for (const sql of migration.sql) {
        await this.execute(sql);
      }
    }
    await this.updateDBVersion(migrations[migrations.length - 1].version);
  }

  private static async migrateIfNeeded(migrations: IMigrationDatabaseOrmSQLite[], currentVersion: number): Promise<void> {
    const expectedVersion = migrations[migrations.length - 1].version;
    if (currentVersion < expectedVersion) {
      console.debug(this.config.database, `Migrating database: current version ${currentVersion}, expected version ${expectedVersion}`);
      for (let version = currentVersion + 1; version <= expectedVersion; version++) {
        await this.migrateToVersion(migrations, version);
      }
      await this.updateDBVersion(migrations[migrations.length - 1].version);
    } else {
      console.debug(this.config.database, 'No migration needed.');
    }
  }

  private static async migrateToVersion(migrations: IMigrationDatabaseOrmSQLite[], version: number): Promise<void> {
    const migration = migrations.find(m => m.version === version);
    if (!migration) throw new Error(`Migration for version ${version} not found`);

    for (const sql of migration.sql) {
      await this.execute(sql);
    }
  }

  private static parseRow(row: any): any {
    Object.keys(row).forEach(key => {
      if (typeof row[key] === 'string' && this.isJSONString(row[key])) {
        row[key] = JSON.parse(row[key]);
      }
    });
    return row;
  }

  private static isJSONString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}
