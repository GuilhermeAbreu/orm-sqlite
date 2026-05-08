import { OrmSQLiteError } from '../errors/orm-sqlite.error';

import type { IColumnTypeOrmSQlite, IModelClassOrmSQlite } from './query-build.definitions';

/**
 * @experimental Esta classe está em desenvolvimento experimental e pode sofrer alterações significativas em versões futuras.
 * Use com cautela em ambiente de produção.
 */
export class QueryDDL {
  private static assertSafeIdentifier(identifier: string, fieldName: string): void {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
      throw new OrmSQLiteError(
        'ERR_UNSAFE_IDENTIFIER',
        `Unsafe SQL identifier for ${fieldName}: '${identifier}'`
      );
    }
  }

  private static getSafeTableName<T>(modelClass: IModelClassOrmSQlite<T>): string {
    if (!modelClass.entityName) {
      throw new OrmSQLiteError('ERR_TABLE_NAME_NOT_INFORMED', 'Nome da tabela não informado');
    }
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    QueryDDL.assertSafeIdentifier(tableName, 'table');
    return tableName;
  }

  static createTable<T>(modelClass: IModelClassOrmSQlite<T>, columns: IColumnTypeOrmSQlite<T>[]): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    const columnDefinitions = columns.map(column => {
      QueryDDL.assertSafeIdentifier(String(column.name), 'createTable column');
      let definition = `${column.name as string} ${column.type}`;
      if (column.primaryKey) definition += ' PRIMARY KEY';
      if (column.autoIncremente) definition += ' AUTOINCREMENT';
      if (column.unique) definition += ' UNIQUE';
      if (column.notNull) definition += ' NOT NULL';
      if (column.defaultValue !== undefined) definition += ` DEFAULT ${QueryDDL.formatValue(column.defaultValue)}`;
      return definition;
    });
    return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(', ')})`;
  }

  static addColumn<T>(modelClass: IModelClassOrmSQlite<T>, column: IColumnTypeOrmSQlite<T>): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    QueryDDL.assertSafeIdentifier(String(column.name), 'addColumn column');
    let columnDefinition = `${column.name as string} ${column.type}`;
    if (column.primaryKey) columnDefinition += ' PRIMARY KEY';
    if (column.unique) columnDefinition += ' UNIQUE';
    if (column.notNull) columnDefinition += ' NOT NULL';
    if (column.defaultValue !== undefined) columnDefinition += ` DEFAULT ${QueryDDL.formatValue(column.defaultValue)}`;
    if (column.autoIncremente) columnDefinition += ' AUTOINCREMENT';
    return `ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`;
  }

  static renameColumn<T>(modelClass: IModelClassOrmSQlite<T>, oldName: keyof T, newName: string): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    QueryDDL.assertSafeIdentifier(String(oldName), 'renameColumn oldName');
    QueryDDL.assertSafeIdentifier(newName, 'renameColumn newName');
    return `ALTER TABLE ${tableName} RENAME COLUMN ${String(oldName)} TO ${newName}`;
  }

  static dropColumn<T>(modelClass: IModelClassOrmSQlite<T>, columnName: keyof T): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    QueryDDL.assertSafeIdentifier(String(columnName), 'dropColumn column');
    return `ALTER TABLE ${tableName} DROP COLUMN ${String(columnName)}`;
  }

  static renameTable<T>(modelClass: IModelClassOrmSQlite<T>, newName: string): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    QueryDDL.assertSafeIdentifier(newName, 'renameTable newName');
    return `ALTER TABLE ${tableName} RENAME TO ${newName}`;
  }

  static dropTable<T>(modelClass: IModelClassOrmSQlite<T>): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    return `DROP TABLE IF EXISTS ${tableName}`;
  }

  static addIndex<T>(modelClass: IModelClassOrmSQlite<T>, indexName: string, columns: (keyof T)[], unique = false): string {
    const tableName = QueryDDL.getSafeTableName(modelClass);
    QueryDDL.assertSafeIdentifier(indexName, 'addIndex indexName');
    columns.forEach(column => QueryDDL.assertSafeIdentifier(String(column), 'addIndex column'));
    const uniqueStr = unique ? 'UNIQUE ' : '';
    return `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')})`;
  }

  static dropIndex(indexName: string): string {
    QueryDDL.assertSafeIdentifier(indexName, 'dropIndex indexName');
    return `DROP INDEX IF EXISTS ${indexName}`;
  }

  private static formatValue(value: any): string {
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    } else if (typeof value === 'string') {
      return `'${QueryDDL.escapeSqlString(value)}'`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return `${value}`;
    } else if (value === null || value === undefined) {
      return 'NULL';
    } else if (typeof value === 'object') {
      return `'${QueryDDL.escapeSqlString(JSON.stringify(value))}'`;
    }
    return `'${QueryDDL.escapeSqlString(String(value))}'`;
  }

  private static escapeSqlString(value: string): string {
    return value.replace(/'/g, "''");
  }
} 
