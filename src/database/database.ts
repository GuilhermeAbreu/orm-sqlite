import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { IDatabaseConnectionOrmSQLite, IMigrationDatabaseOrmSQLite } from './database.definitions';

export class DatabaseConnectionOrmSQlite implements IDatabaseConnectionOrmSQLite {

  protected static sqlite: SQLiteConnection;
  private static _DB: SQLiteDBConnection;
  public static database: string;
  public static encrypted: boolean;
  public static mode: string;
  public static version: number;
  public static readonly: boolean;
  public static log: boolean;

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
    DatabaseConnectionOrmSQlite.database = database;
    DatabaseConnectionOrmSQlite.encrypted = encrypted;
    DatabaseConnectionOrmSQlite.mode = mode;
    DatabaseConnectionOrmSQlite.version = version;
    DatabaseConnectionOrmSQlite.readonly = readonly;
    DatabaseConnectionOrmSQlite.log = log
  }

  get database(): string {
    throw new Error('This method is not an instance method, use the static method');

  }
  get encrypted(): boolean {
    throw new Error('This method is not an instance method, use the static method');

  }
  get mode(): string {
    throw new Error('This method is not an instance method, use the static method');

  }
  get version(): number {
    throw new Error('This method is not an instance method, use the static method');

  }
  get readonly(): boolean {
    throw new Error('This method is not an instance method, use the static method');

  }
  get log(): boolean {
    throw new Error('This method is not an instance method, use the static method');

  }
  isOpen(): Promise<boolean> {
    throw new Error('This method is not an instance method, use the static method');
  }
  createOrReconnectConnection(forceCreate: boolean): Promise<SQLiteDBConnection> {
    forceCreate;
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
    return this.initializeDB();
  }

  public static async isOpen(): Promise<boolean> {
    return (await DatabaseConnectionOrmSQlite._DB.isDBOpen()).result ?? false;
  }

  public static async createOrReconnectConnection(forceCreate: boolean): Promise<SQLiteDBConnection> {
    try {
      const isConsistent = forceCreate || !(await this.sqlite.checkConnectionsConsistency())?.result;
      const dbName = this.database;

      if (!isConsistent) {
        console.debug(`Reconnecting to database ${dbName}`);
        return await this.sqlite.retrieveConnection(dbName, this.readonly);
      }

      console.debug(this.name, `Creating new connection to database ${dbName}`);
      return await this.sqlite.createConnection(
        dbName,
        this.encrypted,
        this.mode,
        this.version,
        this.readonly
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async closeDB(): Promise<void> {
    await (await this.db).close();
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
    await (await this.db).commitTransaction();
  }

  public static async rollbackTransaction(): Promise<void> {
    await (await this.db).rollbackTransaction();
  }

  public static async execute(sql: string): Promise<boolean> {
    if (this.log) {
      console.debug(this.database, sql);
    }
    const db = await this.db;
    const result = await db.run(sql, undefined, false);
    return (result.changes?.changes ?? 0) > 0;
  }

  public static async query<T = any>(sql: string): Promise<T[]> {
    if (this.log) {
      console.debug(this.database, sql);
    }
    const db = await this.db;
    const result: any = await db.query(sql);
    return result.values?.map((row: any) => this.parseRow(row)) ?? [];
  }

  public static async getCurrentDBVersion(): Promise<number | undefined> {
    const result = await this.query<number>(`
        SELECT version FROM db_version
        ORDER BY id DESC LIMIT 1;
      `);
    return result[0];
  }

  public static async updateDBVersion(newVersion: number): Promise<void> {
    await this.execute(`
        INSERT INTO db_version (version) VALUES (${newVersion});
      `);
  }

  public static async recreateDatabase(migration: any[]): Promise<void> {
    await CapacitorSQLite.deleteDatabase({ database: this.database });
    await this.runMigrationsIfNeeded(migration);
  }

  public static async runMigrationsIfNeeded(migrations: any[]): Promise<void> {
    console.debug(this.database, 'Checking if migrations are needed.');
    await this.createDBVersionTableIfNotExists();

    const currentVersion = await this.getCurrentDBVersion();

    if (currentVersion === undefined) {
      console.debug(this.database, 'Initial migration required.');
      await this.runInitialMigrations(migrations);
    } else {
      await this.migrateIfNeeded(migrations, currentVersion);
    }

    await this.updateDBVersion(migrations[migrations.length - 1].version);
  }

  private static async initializeDB(): Promise<SQLiteDBConnection> {
    try {
      const result = await this.sqlite.checkConnectionsConsistency();
      console.debug('Connection Consistency:', result);
    } catch (error) {
      console.error('Error:', error);
    }
    DatabaseConnectionOrmSQlite._DB = await this.createOrReconnectConnection(false);
    if (!(await DatabaseConnectionOrmSQlite._DB.isDBOpen()).result) {
      await DatabaseConnectionOrmSQlite._DB.open();
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
  }

  private static async migrateIfNeeded(migrations: IMigrationDatabaseOrmSQLite[], currentVersion: number): Promise<void> {
    const expectedVersion = migrations[migrations.length - 1].version;
    if (currentVersion < expectedVersion) {
      console.debug(this.database, `Migrating database: current version ${currentVersion}, expected version ${expectedVersion}`);
      for (let version = currentVersion + 1; version <= expectedVersion; version++) {
        await this.migrateToVersion(migrations, version);
      }
    } else {
      console.debug(this.database, 'No migration needed.');
    }
  }

  private static async migrateToVersion(migrations: IMigrationDatabaseOrmSQLite[], version: number): Promise<void> {
    const migration = migrations.find(m => m.version === version);
    if (migration) {
      for (const sql of migration.sql) {
        await this.execute(sql);
      }
    } else {
      console.warn(`Migration to version ${version} not found.`);
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