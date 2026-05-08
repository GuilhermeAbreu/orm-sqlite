import { OrmSQLiteError } from '../src/errors/orm-sqlite.error';
import { QueryDDL } from '../src/query/query-ddl';

import { User } from './class/User.class';

describe('QueryDDL', () => {
  it('should build createTable SQL', () => {
    const sql = QueryDDL.createTable(User, [
      { name: 'id', type: 'INTEGER', primaryKey: true },
      { name: 'name', type: 'TEXT', notNull: true },
    ]);
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS user');
    expect(sql).toContain('id INTEGER PRIMARY KEY');
    expect(sql).toContain('name TEXT NOT NULL');
  });

  it('should build addColumn SQL', () => {
    const sql = QueryDDL.addColumn(User, { name: 'nickname', type: 'TEXT' });
    expect(sql).toBe('ALTER TABLE user ADD COLUMN nickname TEXT');
  });

  it('should build renameColumn SQL', () => {
    const sql = QueryDDL.renameColumn(User, 'name', 'full_name');
    expect(sql).toBe('ALTER TABLE user RENAME COLUMN name TO full_name');
  });

  it('should build dropColumn SQL', () => {
    const sql = QueryDDL.dropColumn(User, 'name');
    expect(sql).toBe('ALTER TABLE user DROP COLUMN name');
  });

  it('should build renameTable SQL', () => {
    const sql = QueryDDL.renameTable(User, 'users_v2');
    expect(sql).toBe('ALTER TABLE user RENAME TO users_v2');
  });

  it('should build dropTable SQL', () => {
    const sql = QueryDDL.dropTable(User);
    expect(sql).toBe('DROP TABLE IF EXISTS user');
  });

  it('should build addIndex and dropIndex SQL', () => {
    expect(QueryDDL.addIndex(User, 'idx_user_name', ['name'])).toBe(
      'CREATE INDEX IF NOT EXISTS idx_user_name ON user (name)'
    );
    expect(QueryDDL.addIndex(User, 'idx_user_name_uq', ['name'], true)).toBe(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_user_name_uq ON user (name)'
    );
    expect(QueryDDL.dropIndex('idx_user_name')).toBe('DROP INDEX IF EXISTS idx_user_name');
  });

  it('should expose stable error code for unsafe index identifier', () => {
    try {
      QueryDDL.addIndex(User, 'idx_user;DROP TABLE user;--', ['id']);
      throw new Error('expected addIndex to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should expose stable error code for unsafe table rename identifier', () => {
    try {
      QueryDDL.renameTable(User, 'new_name;DROP TABLE user;--');
      throw new Error('expected renameTable to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should expose stable error code when model has no table name metadata', () => {
    class ModelWithoutEntityName {
      id!: number;
    }

    try {
      QueryDDL.dropTable(ModelWithoutEntityName as any);
      throw new Error('expected dropTable to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_TABLE_NAME_NOT_INFORMED');
    }
  });

  it('should expose stable error code for unsafe column identifier in addColumn', () => {
    try {
      QueryDDL.addColumn(User, { name: 'nick;DROP TABLE user;--' as any, type: 'TEXT' });
      throw new Error('expected addColumn to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });
});
