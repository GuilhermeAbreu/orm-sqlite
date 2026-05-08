import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { DatabaseConnectionOrmSQlite } from '../src/database/database';
import { OrmSQLiteError } from '../src/errors/orm-sqlite.error';

type MockDBConnection = {
  isDBOpen: jest.MockedFunction<() => Promise<{ result: boolean }>>;
  isTransactionActive: jest.MockedFunction<() => Promise<{ result: boolean }>>;
  beginTransaction: jest.MockedFunction<() => Promise<void>>;
  commitTransaction: jest.MockedFunction<() => Promise<void>>;
  rollbackTransaction: jest.MockedFunction<() => Promise<void>>;
  open: jest.MockedFunction<() => Promise<void>>;
  close: jest.MockedFunction<() => Promise<void>>;
  query?: jest.MockedFunction<(...args: any[]) => Promise<any>>;
  run?: jest.MockedFunction<(...args: any[]) => Promise<any>>;
};

type MockSQLiteConnection = {
  checkConnectionsConsistency: jest.MockedFunction<() => Promise<{ result: boolean }>>;
  retrieveConnection: jest.MockedFunction<(...args: any[]) => Promise<MockDBConnection>>;
  createConnection: jest.MockedFunction<(...args: any[]) => Promise<MockDBConnection>>;
};

function createMockDBConnection(isOpen = false): MockDBConnection {
  return {
    isDBOpen: jest.fn(async () => ({ result: isOpen })),
    isTransactionActive: jest.fn(async () => ({ result: false })),
    beginTransaction: jest.fn(async () => undefined),
    commitTransaction: jest.fn(async () => undefined),
    rollbackTransaction: jest.fn(async () => undefined),
    open: jest.fn(async () => undefined),
    close: jest.fn(async () => undefined),
    run: jest.fn(async () => ({
      changes: {
        changes: 0,
        values: [],
      },
    })),
  };
}

function createMockSQLiteConnection(): MockSQLiteConnection {
  return {
    checkConnectionsConsistency: jest.fn(async () => ({ result: true })),
    retrieveConnection: jest.fn(),
    createConnection: jest.fn(),
  };
}

function resetConnectionState(): void {
  (DatabaseConnectionOrmSQlite as any)._DB = undefined;
  (DatabaseConnectionOrmSQlite as any)._connectionPromise = undefined;
  (DatabaseConnectionOrmSQlite as any).sqlite = undefined;
  DatabaseConnectionOrmSQlite.setConfig({
    database: '',
    encrypted: false,
    mode: 'no-encryption',
    version: 1,
    readonly: false,
    log: false,
  });
}

describe('DatabaseConnectionOrmSQlite connection resilience', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetConnectionState();
  });

  it('should initialize connection only once when multiple callers request db concurrently', async () => {
    const sqlite = createMockSQLiteConnection();
    const dbConn = createMockDBConnection(false);

    sqlite.retrieveConnection.mockRejectedValue(new Error('not found'));
    sqlite.createConnection.mockImplementation(
      () =>
        new Promise<MockDBConnection>(resolve => {
          setTimeout(() => resolve(dbConn), 20);
        })
    );

    new DatabaseConnectionOrmSQlite(
      sqlite as any,
      'app_db',
      false,
      'no-encryption',
      1,
      false,
      false
    );

    const [dbA, dbB, dbC] = await Promise.all([
      DatabaseConnectionOrmSQlite.db,
      DatabaseConnectionOrmSQlite.db,
      DatabaseConnectionOrmSQlite.db,
    ]);

    expect(dbA).toBe(dbConn);
    expect(dbB).toBe(dbConn);
    expect(dbC).toBe(dbConn);
    expect(sqlite.createConnection).toHaveBeenCalledTimes(1);
    expect(dbConn.open).toHaveBeenCalledTimes(1);
  });

  it('should recover by retrieving connection when createConnection fails with already exists', async () => {
    const sqlite = createMockSQLiteConnection();
    const dbConn = createMockDBConnection(false);

    sqlite.retrieveConnection
      .mockRejectedValueOnce(new Error('missing'))
      .mockResolvedValueOnce(dbConn);
    sqlite.createConnection.mockRejectedValue(new Error('Connection already exists'));

    new DatabaseConnectionOrmSQlite(
      sqlite as any,
      'app_db',
      false,
      'no-encryption',
      1,
      false,
      false
    );

    const db = await DatabaseConnectionOrmSQlite.db;

    expect(db).toBe(dbConn);
    expect(sqlite.createConnection).toHaveBeenCalledTimes(1);
    expect(sqlite.retrieveConnection).toHaveBeenCalledTimes(2);
    expect(dbConn.open).toHaveBeenCalledTimes(1);
  });

  it('should throw a clear error when connection config is not initialized', async () => {
    await expect(DatabaseConnectionOrmSQlite.createOrReconnectConnection()).rejects.toThrow(
      'SQLiteConnection not configured'
    );
  });

  it('should throw Error when executing an empty SQL string', async () => {
    await expect(DatabaseConnectionOrmSQlite.execute('   ')).rejects.toThrow(
      'The sql passed in the parameter is empty'
    );
  });

  it('should expose stable error code for empty SQL', async () => {
    try {
      await DatabaseConnectionOrmSQlite.execute('   ');
      throw new Error('expected execute to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_EMPTY_SQL');
    }
  });

  it('should throw clear error when migrations list is empty', async () => {
    await expect(DatabaseConnectionOrmSQlite.runMigrationsIfNeeded([])).rejects.toThrow(
      'Migrations list is empty'
    );
  });

  it('should throw clear error when migrations contain duplicate versions', async () => {
    await expect(
      DatabaseConnectionOrmSQlite.runMigrationsIfNeeded([
        { version: 1, sql: ['CREATE TABLE a (id INTEGER);'] },
        { version: 1, sql: ['CREATE TABLE b (id INTEGER);'] },
      ])
    ).rejects.toThrow('Duplicate migration version detected');
  });

  it('should throw clear error when migrations are not sorted', async () => {
    await expect(
      DatabaseConnectionOrmSQlite.runMigrationsIfNeeded([
        { version: 2, sql: ['CREATE TABLE b (id INTEGER);'] },
        { version: 1, sql: ['CREATE TABLE a (id INTEGER);'] },
      ])
    ).rejects.toThrow('Migrations must be sorted in ascending order');
  });

  it('should expose stable error code when migration version is missing', async () => {
    const sqlite = createMockSQLiteConnection();
    const dbConn = createMockDBConnection(true);
    const queryMock: jest.MockedFunction<(...args: any[]) => Promise<any>> = jest.fn();
    queryMock.mockResolvedValue({ values: [{ version: 1 }] });
    dbConn.query = queryMock;

    sqlite.retrieveConnection.mockResolvedValue(dbConn);

    new DatabaseConnectionOrmSQlite(
      sqlite as any,
      'app_db',
      false,
      'no-encryption',
      1,
      false,
      false
    );

    try {
      await DatabaseConnectionOrmSQlite.runMigrationsIfNeeded([
        { version: 1, sql: ['CREATE TABLE a (id INTEGER);'] },
        { version: 3, sql: ['CREATE TABLE c (id INTEGER);'] },
      ]);
      throw new Error('expected runMigrationsIfNeeded to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_MIGRATION_NOT_FOUND');
    }
  });

  it('should parse only object/array JSON strings and keep scalar JSON-like strings untouched', async () => {
    const mockDb = createMockDBConnection(true);
    mockDb.query = jest.fn(async () => ({
      values: [
        {
          scalarNumberAsString: '123',
          scalarBooleanAsString: 'true',
          jsonObject: '{"a":1}',
          jsonArray: '[1,2]',
        },
      ],
    }));

    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db' });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    const result = await DatabaseConnectionOrmSQlite.query<any>('SELECT * FROM any_table');

    expect(result[0].scalarNumberAsString).toBe('123');
    expect(result[0].scalarBooleanAsString).toBe('true');
    expect(result[0].jsonObject).toEqual({ a: 1 });
    expect(result[0].jsonArray).toEqual([1, 2]);
  });

  it('should rollback migration transaction on SQL execution error', async () => {
    const sqlite = createMockSQLiteConnection();
    const dbConn = createMockDBConnection(true);
    const queryMock: jest.MockedFunction<(...args: any[]) => Promise<any>> = jest.fn();
    queryMock.mockResolvedValue({ values: [] });
    dbConn.query = queryMock;
    const runMock: jest.MockedFunction<(...args: any[]) => Promise<any>> = jest.fn();
    runMock.mockResolvedValueOnce({ changes: { changes: 0, values: [] } });
    runMock.mockRejectedValueOnce(new Error('sql failed'));
    dbConn.run = runMock;

    sqlite.retrieveConnection.mockResolvedValue(dbConn);

    new DatabaseConnectionOrmSQlite(
      sqlite as any,
      'app_db',
      false,
      'no-encryption',
      1,
      false,
      false
    );

    await expect(
      DatabaseConnectionOrmSQlite.runMigrationsIfNeeded([
        { version: 1, sql: ['CREATE TABLE a (id INTEGER);', 'INVALID SQL'] },
      ])
    ).rejects.toThrow('sql failed');

    expect(dbConn.beginTransaction).toHaveBeenCalled();
    expect(dbConn.rollbackTransaction).toHaveBeenCalled();
    expect(dbConn.commitTransaction).not.toHaveBeenCalled();
  });

  it('should throw ERR_INVALID_CONFIG when mode is invalid', async () => {
    const sqlite = createMockSQLiteConnection();
    new DatabaseConnectionOrmSQlite(sqlite as any, 'app_db', false, 'invalid-mode', 1, false, false);

    try {
      await DatabaseConnectionOrmSQlite.createOrReconnectConnection();
      throw new Error('expected createOrReconnectConnection to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_INVALID_CONFIG');
    }
  });

  it('should throw ERR_INVALID_CONFIG when version is invalid', async () => {
    const sqlite = createMockSQLiteConnection();
    new DatabaseConnectionOrmSQlite(sqlite as any, 'app_db', false, 'no-encryption', 0, false, false);

    try {
      await DatabaseConnectionOrmSQlite.createOrReconnectConnection();
      throw new Error('expected createOrReconnectConnection to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_INVALID_CONFIG');
    }
  });

  it('should stabilize connection when setConfig happens before query', async () => {
    const sqlite = createMockSQLiteConnection();
    const dbConn = createMockDBConnection(false);
    sqlite.retrieveConnection.mockResolvedValue(dbConn);

    new DatabaseConnectionOrmSQlite(sqlite as any, 'app_db', false, 'no-encryption', 1, false, false);
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db_v2', mode: 'no-encryption', version: 2 });

    await DatabaseConnectionOrmSQlite.db;
    expect(sqlite.retrieveConnection).toHaveBeenCalledWith('app_db_v2', false);
  });

  it('should not call open when connection is already open', async () => {
    const sqlite = createMockSQLiteConnection();
    const dbConn = createMockDBConnection(true);
    sqlite.retrieveConnection.mockResolvedValue(dbConn);

    new DatabaseConnectionOrmSQlite(
      sqlite as any,
      'app_db',
      false,
      'no-encryption',
      1,
      false,
      false
    );

    await DatabaseConnectionOrmSQlite.db;
    expect(dbConn.open).not.toHaveBeenCalled();
  });

  it('should close and clear db reference on closeDB', async () => {
    const dbConn = createMockDBConnection(true);
    (DatabaseConnectionOrmSQlite as any)._DB = dbConn;

    await DatabaseConnectionOrmSQlite.closeDB();

    expect(dbConn.close).toHaveBeenCalled();
    expect((DatabaseConnectionOrmSQlite as any)._DB).toBeUndefined();
  });

  it('should begin transaction only when there is no active transaction', async () => {
    const dbConn = createMockDBConnection(true);
    dbConn.isTransactionActive.mockResolvedValueOnce({ result: true });
    (DatabaseConnectionOrmSQlite as any)._DB = dbConn;

    await DatabaseConnectionOrmSQlite.beginTransaction();
    expect(dbConn.beginTransaction).not.toHaveBeenCalled();

    dbConn.isTransactionActive.mockResolvedValueOnce({ result: false });
    await DatabaseConnectionOrmSQlite.beginTransaction();
    expect(dbConn.beginTransaction).toHaveBeenCalledTimes(1);
  });

  it('should forward commit and rollback to active db connection', async () => {
    const dbConn = createMockDBConnection(true);
    (DatabaseConnectionOrmSQlite as any)._DB = dbConn;

    await DatabaseConnectionOrmSQlite.commitTransaction();
    await DatabaseConnectionOrmSQlite.rollbackTransaction();

    expect(dbConn.commitTransaction).toHaveBeenCalledTimes(1);
    expect(dbConn.rollbackTransaction).toHaveBeenCalledTimes(1);
  });

  it('should keep non-json text unchanged in query parseRow', async () => {
    const mockDb = createMockDBConnection(true);
    mockDb.query = jest.fn(async () => ({
      values: [{ text: 'plain-text', maybeJsonLike: '{invalid-json' }],
    }));

    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db' });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    const result = await DatabaseConnectionOrmSQlite.query<any>('SELECT x');
    expect(result[0].text).toBe('plain-text');
    expect(result[0].maybeJsonLike).toBe('{invalid-json');
  });

  it('should execute query with params through database driver', async () => {
    const mockDb = createMockDBConnection(true);
    mockDb.query = jest.fn(async () => ({ values: [{ id: 1, name: 'John' }] }));

    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db', mode: 'no-encryption', version: 1 });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    const rows = await DatabaseConnectionOrmSQlite.queryWithParams('SELECT * FROM user WHERE id = ?', [1]);
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM user WHERE id = ?', [1]);
    expect(rows).toEqual([{ id: 1, name: 'John' }]);
  });

  it('should execute run with params through database driver', async () => {
    const mockDb = createMockDBConnection(true);
    mockDb.run = jest.fn(async () => ({ changes: { changes: 1, values: [{ id: 1 }] } }));

    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db', mode: 'no-encryption', version: 1 });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    const result = await DatabaseConnectionOrmSQlite.executeWithParams(
      'INSERT INTO user(name) VALUES (?)',
      ['John']
    );

    expect(mockDb.run).toHaveBeenCalledWith('INSERT INTO user(name) VALUES (?)', ['John'], false, 'all');
    expect(result.hasChanged).toBe(true);
    expect(result.changes).toBe(1);
  });

  it('should return first row with queryOneWithParams or null', async () => {
    const mockDb = createMockDBConnection(true);
    const queryMock: jest.MockedFunction<(...args: any[]) => Promise<any>> = jest.fn();
    queryMock.mockResolvedValueOnce({ values: [{ id: 1, name: 'John' }] });
    queryMock.mockResolvedValueOnce({ values: [] });
    mockDb.query = queryMock;

    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db', mode: 'no-encryption', version: 1 });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    const first = await DatabaseConnectionOrmSQlite.queryOneWithParams('SELECT * FROM user WHERE id = ?', [1]);
    const none = await DatabaseConnectionOrmSQlite.queryOneWithParams('SELECT * FROM user WHERE id = ?', [999]);

    expect(first).toEqual({ id: 1, name: 'John' });
    expect(none).toBeNull();
  });

  it('should execute transaction with automatic begin and commit', async () => {
    const mockDb = createMockDBConnection(true);
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db', mode: 'no-encryption', version: 1 });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    const result = await DatabaseConnectionOrmSQlite.executeTransaction(async () => 'ok');
    expect(result).toBe('ok');
    expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1);
    expect(mockDb.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockDb.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback transaction when callback throws', async () => {
    const mockDb = createMockDBConnection(true);
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;
    (DatabaseConnectionOrmSQlite as any).sqlite = createMockSQLiteConnection();
    DatabaseConnectionOrmSQlite.setConfig({ database: 'app_db', mode: 'no-encryption', version: 1 });
    (DatabaseConnectionOrmSQlite as any)._DB = mockDb;

    await expect(
      DatabaseConnectionOrmSQlite.executeTransaction(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(mockDb.beginTransaction).toHaveBeenCalledTimes(1);
    expect(mockDb.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockDb.commitTransaction).not.toHaveBeenCalled();
  });
});
