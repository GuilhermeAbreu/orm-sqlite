import type { IColumnTypeOrmSQlite, IModelClassOrmSQlite } from './query-build.definitions';

export class QueryDDL {
  static createTable<T>(modelClass: IModelClassOrmSQlite<T>, columns: IColumnTypeOrmSQlite<T>[]): string {
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    const columnDefinitions = columns.map(column => {
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
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    let columnDefinition = `${column.name as string} ${column.type}`;
    if (column.primaryKey) columnDefinition += ' PRIMARY KEY';
    if (column.unique) columnDefinition += ' UNIQUE';
    if (column.notNull) columnDefinition += ' NOT NULL';
    if (column.defaultValue !== undefined) columnDefinition += ` DEFAULT ${QueryDDL.formatValue(column.defaultValue)}`;
    if (column.autoIncremente) columnDefinition += ' AUTOINCREMENT';
    return `ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`;
  }

  static renameColumn<T>(modelClass: IModelClassOrmSQlite<T>, oldName: keyof T, newName: string): string {
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    return `ALTER TABLE ${tableName} RENAME COLUMN ${String(oldName)} TO ${newName}`;
  }

  static dropColumn<T>(modelClass: IModelClassOrmSQlite<T>, columnName: keyof T): string {
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    return `ALTER TABLE ${tableName} DROP COLUMN ${String(columnName)}`;
  }

  static renameTable<T>(modelClass: IModelClassOrmSQlite<T>, newName: string): string {
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    return `ALTER TABLE ${tableName} RENAME TO ${newName}`;
  }

  static dropTable<T>(modelClass: IModelClassOrmSQlite<T>): string {
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    return `DROP TABLE IF EXISTS ${tableName}`;
  }

  static addIndex<T>(modelClass: IModelClassOrmSQlite<T>, indexName: string, columns: (keyof T)[], unique = false): string {
    if (!modelClass.entityName) throw new Error('Nome da tabela não informado');
    const tableName = modelClass.entityName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    const uniqueStr = unique ? 'UNIQUE ' : '';
    return `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')})`;
  }

  static dropIndex(indexName: string): string {
    return `DROP INDEX IF EXISTS ${indexName}`;
  }

  private static formatValue(value: any): string {
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    } else if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      return `${value}`;
    } else if (value === null || value === undefined) {
      return 'NULL';
    } else if (typeof value === 'object') {
      return `'${JSON.stringify(value)}'`;
    }
    return `'${value}'`;
  }
} 