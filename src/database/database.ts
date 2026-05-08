import type { SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

import { OrmSQLiteError } from '../errors/orm-sqlite.error';

import type {
  IDatabaseConfig,
  IDatabaseConnectionOrmSQLite,
  IMigrationDatabaseOrmSQLite,
  IReturnExecuteQuery
} from './database.definitions';

export class DatabaseConnectionOrmSQlite implements IDatabaseConnectionOrmSQLite {
  protected static sqlite: SQLiteConnection;
  private static _DB: SQLiteDBConnection | undefined;
  private static _connectionPromise: Promise<SQLiteDBConnection> | undefined;

  private static config = {
    database: '',
    encrypted: false,
    mode: '',
    version: 1,
    readonly: false,
    log: false
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
    DatabaseConnectionOrmSQlite._DB = undefined; // Reset DB connection to force reinitialization with new config
    DatabaseConnectionOrmSQlite._connectionPromise = undefined;
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
  execute<T = any>(sql: string): Promise<IReturnExecuteQuery<T>> {
    sql;
    throw new Error('This method is not an instance method, use the static method');
  }
  executeWithParams<T = any>(sql: string, params: any[]): Promise<IReturnExecuteQuery<T>> {
    sql;
    params;
    throw new Error('This method is not an instance method, use the static method');
  }
  executeTransaction<T = any>(work: () => Promise<T>): Promise<T> {
    work;
    throw new Error('This method is not an instance method, use the static method');
  }
  query<T = any>(sql: string): Promise<T[]> {
    sql;
    throw new Error('This method is not an instance method, use the static method');
  }
  queryWithParams<T = any>(sql: string, params: any[]): Promise<T[]> {
    sql;
    params;
    throw new Error('This method is not an instance method, use the static method');
  }
  queryOneWithParams<T = any>(sql: string, params: any[]): Promise<T | null> {
    sql;
    params;
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
    return this.initializeDB();
  }

  public static async isOpen(): Promise<boolean> {
    if (!DatabaseConnectionOrmSQlite._DB) return false;
    return (await DatabaseConnectionOrmSQlite._DB.isDBOpen()).result ?? false;
  }

  public static async createOrReconnectConnection(): Promise<SQLiteDBConnection> {
    const dbName = this.config.database;

    this.validateConnectionConfig();

    try {
      // Check connections consistency
      const isConsistent = (await this.sqlite.checkConnectionsConsistency())?.result;
      if (!isConsistent) {
        console.debug(`Inconsistent connections detected. Creating new connection to database ${dbName}`);
        return await this.createConnectionWithFallback(dbName);
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
        connection = await this.createConnectionWithFallback(dbName);
        console.debug(`Created new connection to database ${dbName}`);
      }

      return connection;
    } catch (error) {
      console.error(`Error creating or reconnecting to database ${dbName}:`, error);
      throw error;
    }
  }

  public static async closeDB(): Promise<void> {
    DatabaseConnectionOrmSQlite._connectionPromise = undefined;
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
  }

  public static async commitTransaction(): Promise<void> {
    const db = await this.db;
    await db.commitTransaction();
  }

  public static async rollbackTransaction(): Promise<void> {
    const db = await this.db;
    await db.rollbackTransaction();
  }

  public static async execute<T = any>(sql: string): Promise<IReturnExecuteQuery<T>> {
    if (this.config.log) {
      console.debug(this.config.database, ' | SQL: ', sql);
    }

    this.validateSql(sql);

    const db = await this.db;
    const result = await db.run(sql, undefined, false, 'all');
    const values = result.changes?.values ?? [];
    const changes = result.changes?.changes ?? 0;

    return {
      changes: changes,
      hasChanged: changes > 0,
      values: values ?? [],
      changedValues: values.slice(-changes) ?? []
    };
  }

  public static async executeWithParams<T = any>(sql: string, params: any[]): Promise<IReturnExecuteQuery<T>> {
    if (this.config.log) {
      console.debug(this.config.database, ' | SQL: ', sql, ' | PARAMS: ', params);
    }

    this.validateSql(sql);

    const db = await this.db;
    const result = await db.run(sql, params, false, 'all');

    const values = result.changes?.values ?? [];
    const changes = result.changes?.changes ?? 0;

    return {
      changes: changes,
      hasChanged: changes > 0,
      values: values ?? [],
      changedValues: values.slice(-changes) ?? []
    };
  }

  public static async query<T = any>(sql: string): Promise<T[]> {
    if (this.config.log) {
      console.debug(this.config.database, ' | SQL: ', sql);
    }

    this.validateSql(sql);

    const db = await this.db;
    const result: any = await db.query(sql);
    return result.values?.map((row: any) => this.parseRow(row)) ?? [];
  }

  public static async queryWithParams<T = any>(sql: string, params: any[]): Promise<T[]> {
    if (this.config.log) {
      console.debug(this.config.database, ' | SQL: ', sql, ' | PARAMS: ', params);
    }

    this.validateSql(sql);

    const db = await this.db;
    const result: any = await db.query(sql, params);
    return result.values?.map((row: any) => this.parseRow(row)) ?? [];
  }

  public static async queryOneWithParams<T = any>(sql: string, params: any[]): Promise<T | null> {
    const rows = await this.queryWithParams<T>(sql, params);
    return rows[0] ?? null;
  }

  public static async executeTransaction<T = any>(work: () => Promise<T>): Promise<T> {
    const db = await this.db;
    const hasActiveTx = (await db.isTransactionActive()).result ?? false;

    if (hasActiveTx) {
      return work();
    }

    await db.beginTransaction();
    try {
      const result = await work();
      await db.commitTransaction();
      return result;
    } catch (error) {
      await db.rollbackTransaction();
      throw error;
    }
  }

  public static async getCurrentDBVersion(): Promise<number | undefined> {
    const result = await this.query<{ version: number }>(`
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
    this.validateMigrations(migration);
    await this.closeDB();
    await CapacitorSQLite.deleteDatabase({ database: this.config.database });
    this.setConfig(this.config);
    await this.runMigrationsIfNeeded(migration);
  }

  public static async runMigrationsIfNeeded(migrations: IMigrationDatabaseOrmSQLite[]): Promise<void> {
    this.validateMigrations(migrations);
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
    if (DatabaseConnectionOrmSQlite._DB) {
      return DatabaseConnectionOrmSQlite._DB;
    }

    if (!DatabaseConnectionOrmSQlite._connectionPromise) {
      DatabaseConnectionOrmSQlite._connectionPromise = (async () => {
        const connection = await this.createOrReconnectConnection();
        if (!(await connection.isDBOpen()).result) {
          await connection.open();
        }
        DatabaseConnectionOrmSQlite._DB = connection;
        return connection;
      })();
    }

    try {
      return await DatabaseConnectionOrmSQlite._connectionPromise;
    } finally {
      DatabaseConnectionOrmSQlite._connectionPromise = undefined;
    }
  }

  private static async createConnectionWithFallback(dbName: string): Promise<SQLiteDBConnection> {
    try {
      return await this.sqlite.createConnection(dbName, this.config.encrypted, this.config.mode, this.config.version, this.config.readonly);
    } catch (error) {
      const message = `${error}`;
      if (message.toLowerCase().includes('connection') && message.toLowerCase().includes('exist')) {
        return await this.sqlite.retrieveConnection(dbName, this.config.readonly);
      }
      throw error;
    }
  }

  private static validateConnectionConfig(): void {
    const allowedModes = ['no-encryption', 'encryption', 'secret', 'decryption'];

    if (!this.sqlite) {
      throw new OrmSQLiteError(
        'ERR_SQLITE_NOT_CONFIGURED',
        'SQLiteConnection not configured. Initialize DatabaseConnectionOrmSQlite before querying.'
      );
    }
    if (!this.config.database?.trim()) {
      throw new OrmSQLiteError(
        'ERR_DATABASE_NAME_NOT_CONFIGURED',
        'Database name not configured. Provide a valid database name in DatabaseConnectionOrmSQlite.'
      );
    }
    if (!this.config.mode?.trim() || !allowedModes.includes(this.config.mode)) {
      throw new OrmSQLiteError(
        'ERR_INVALID_CONFIG',
        `Invalid database mode '${this.config.mode}'. Allowed values: ${allowedModes.join(', ')}.`
      );
    }
    if (!Number.isInteger(this.config.version) || this.config.version <= 0) {
      throw new OrmSQLiteError(
        'ERR_INVALID_CONFIG',
        `Invalid database version '${this.config.version}'. Version must be a positive integer.`
      );
    }
  }

  private static validateSql(sql: string): void {
    if (typeof sql !== 'string' || !sql.trim()) {
      throw new OrmSQLiteError('ERR_EMPTY_SQL', 'The sql passed in the parameter is empty');
    }
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

  private static async runInitialMigrations(migrations: IMigrationDatabaseOrmSQLite[]): Promise<void> {
    for (const migration of migrations) {
      await this.executeMigrationSqlInTransaction(migration.sql);
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
    if (!migration) {
      throw new OrmSQLiteError('ERR_MIGRATION_NOT_FOUND', `Migration for version ${version} not found`);
    }

    await this.executeMigrationSqlInTransaction(migration.sql);
  }

  private static async executeMigrationSqlInTransaction(sqlList: string[]): Promise<void> {
    const db = await this.db;
    const hasActiveTx = (await db.isTransactionActive()).result ?? false;

    if (hasActiveTx) {
      for (const sql of sqlList) {
        await this.execute(sql);
      }
      return;
    }

    await db.beginTransaction();
    try {
      for (const sql of sqlList) {
        await this.execute(sql);
      }
      await db.commitTransaction();
    } catch (error) {
      await db.rollbackTransaction();
      throw error;
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
    const trimmed = str.trim();
    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
      return false;
    }

    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  private static validateMigrations(migrations: IMigrationDatabaseOrmSQLite[]): void {
    if (!Array.isArray(migrations) || migrations.length === 0) {
      throw new OrmSQLiteError('ERR_INVALID_MIGRATIONS', 'Migrations list is empty. Provide at least one migration version.');
    }

    const versions = migrations.map(m => m.version);
    const uniqueVersions = new Set(versions);
    if (uniqueVersions.size !== versions.length) {
      throw new OrmSQLiteError('ERR_INVALID_MIGRATIONS', 'Duplicate migration version detected. Migration versions must be unique.');
    }

    for (let i = 1; i < migrations.length; i++) {
      if (migrations[i].version <= migrations[i - 1].version) {
        throw new OrmSQLiteError('ERR_INVALID_MIGRATIONS', 'Migrations must be sorted in ascending order by version.');
      }
    }
  }
}
