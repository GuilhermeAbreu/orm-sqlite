import { OrmSQLiteError } from '../errors/orm-sqlite.error';

import type { IModelClassOrmSQlite, JoinOption, OrderByDirection, QueryOptions, WhereCondition } from './query-build.definitions';

/**
 * @experimental Esta classe está em desenvolvimento experimental e pode sofrer alterações significativas em versões futuras.
 * Use com cautela em ambiente de produção.
 */

export class QueryBuildSQlite<T = any> {
  private tableName: string;
  private classModel: IModelClassOrmSQlite<T>;
  private conditions: string[] = [];
  private joins: string[] = [];
  private orderByClause: string[] = [];
  private limitClause?: string;
  private offsetClause?: string;
  private selectColumns: string[] = ['*'];
  private currentOperation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT';

  constructor(modelClass: IModelClassOrmSQlite<T>) {
    this.classModel = modelClass;
    this.tableName = this.getTableName(modelClass);
    this.classModel;
  }

  private assertSafeIdentifier(identifier: string, fieldName: string): void {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
      throw new OrmSQLiteError('ERR_UNSAFE_IDENTIFIER', `Unsafe SQL identifier for ${fieldName}: '${identifier}'`);
    }
  }

  private getTableName(modelClass: IModelClassOrmSQlite<any>): string {
    const className = modelClass.entityName;
    if (!className) {
      throw new OrmSQLiteError('ERR_TABLE_NAME_NOT_INFORMED', 'Nome da tabela não informada ' + modelClass);
    }
    const tableName = className.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    this.assertSafeIdentifier(tableName, 'table');
    return tableName;
  }

  findMany(options?: QueryOptions<T, any>): string {
    this.currentOperation = 'SELECT';
    this.selectColumns = options?.select?.map(col => {
      const column = String(col);
      this.assertSafeIdentifier(column, 'select column');
      return `${this.tableName}.${column}`;
    }) || ['*'];
    this.processWhere(options?.where);
    if (options?.or) {
      this.processOr(options.or);
    }
    this.processOrderBy(options?.orderBy);
    this.processLimit(options?.take, options?.skip);
    this.processGroupBy(options?.groupBy);
    this.processHaving(options?.having);
    this.processJoin(options?.join as JoinOption<any>[]);
    return this.toString();
  }

  findFirst(options?: QueryOptions<T>): string {
    return this.findMany({ ...options, take: 1 });
  }

  private processWhere(where?: WhereCondition<T> | WhereCondition<T>[]): void {
    if (!where) return;

    if (Array.isArray(where)) {
      const orConditions = where.map(cond => {
        const conditions = Object.entries(cond).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const conditions = Object.entries(value).map(([operator, operatorValue]) => {
              return this.buildWhereCondition(key, operator, operatorValue);
            });
            return conditions.join(' AND ');
          }
          this.assertSafeIdentifier(key, 'where column');
          return `${this.tableName}.${key} = ${this.formatValue(value)}`;
        });
        return `(${conditions.join(' AND ')})`;
      });
      this.conditions.push(orConditions.join(' OR '));
      return;
    }

    const conditions = Object.entries(where).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const conditions = Object.entries(value).map(([operator, operatorValue]) => {
          return this.buildWhereCondition(key, operator, operatorValue);
        });
        return conditions.join(' AND ');
      }
      this.assertSafeIdentifier(key, 'where column');
      return `${this.tableName}.${key} = ${this.formatValue(value)}`;
    });

    this.conditions.push(...conditions);
  }

  private processOr(orArray?: WhereCondition<T>[]): void {
    if (!orArray) return;
    const orConditions = orArray.map(cond => {
      const conditions = Object.entries(cond).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          const operator = Object.keys(value)[0];
          const operatorValue = (value as any)[operator];
          return this.buildWhereCondition(key, operator, operatorValue);
        }
        this.assertSafeIdentifier(key, 'or column');
        return `${this.tableName}.${key} = ${this.formatValue(value)}`;
      });
      return `(${conditions.join(' AND ')})`;
    });
    this.conditions.push(orConditions.join(' OR '));
  }

  private processOrderBy(orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>): void {
    if (!orderBy) return;

    const orders = Object.entries(orderBy).map(([key, direction]) => {
      this.assertSafeIdentifier(key, 'orderBy column');
      return `${this.tableName}.${key} ${(direction as OrderByDirection).toUpperCase()}`;
    });
    this.orderByClause.push(...orders);
  }

  private processLimit(take?: number, skip?: number): void {
    if (take !== undefined) {
      this.limitClause = `LIMIT ${take}`;
    }
    if (skip !== undefined) {
      this.offsetClause = `OFFSET ${skip}`;
    }
  }

  private processGroupBy(groupBy?: (keyof T)[]): void {
    if (!groupBy) return;
    this.selectColumns = groupBy.map(col => {
      const column = String(col);
      this.assertSafeIdentifier(column, 'groupBy column');
      return `${this.tableName}.${column}`;
    });
  }

  private processHaving(having?: WhereCondition<T>): void {
    if (!having) return;
    this.processWhere(having);
  }

  private processJoin(joins?: JoinOption<any>[]): void {
    if (!joins) return;
    const joinStrings: string[] = [];
    for (const join of joins) {
      const joinTableName = this.getTableName(join.table);
      let onClause = '';
      if (typeof join.on === 'string') {
        onClause = join.on;
      } else if (Array.isArray(join.on)) {
        onClause = join.on.join(' AND ');
      } else if (typeof join.on === 'object' && join.on !== null) {
        const onConditions = Object.entries(join.on).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const operator = Object.keys(value)[0];
            const operatorValue = (value as any)[operator];
            this.assertSafeIdentifier(key, 'join on column');
            return `${joinTableName}.${key} ${this.getSQLOperator(operator)} ${this.formatValue(operatorValue)}`;
          }
          this.assertSafeIdentifier(key, 'join on column');
          return `${joinTableName}.${key} = ${this.formatValue(value)}`;
        });
        onClause = onConditions.join(' AND ');
      }
      let joinStr = `${join.type} JOIN ${joinTableName} ON ${onClause}`;
      // Processa joins aninhados recursivamente
      if (join.join && join.join.length > 0) {
        joinStr += ' ' + this.processJoinRecursive(join.join);
      }
      joinStrings.push(joinStr);
    }
    this.joins = joinStrings;
  }

  private processJoinRecursive(joins?: JoinOption<any>[]): string {
    if (!joins) return '';
    return joins
      .map(join => {
        const joinTableName = this.getTableName(join.table);
        let onClause = '';
        if (typeof join.on === 'string') {
          onClause = join.on;
        } else if (Array.isArray(join.on)) {
          onClause = join.on.join(' AND ');
        } else if (typeof join.on === 'object' && join.on !== null) {
          const onConditions = Object.entries(join.on).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              const operator = Object.keys(value)[0];
              const operatorValue = (value as any)[operator];
              this.assertSafeIdentifier(key, 'nested join on column');
              return `${joinTableName}.${key} ${this.getSQLOperator(operator)} ${this.formatValue(operatorValue)}`;
            }
            this.assertSafeIdentifier(key, 'nested join on column');
            return `${joinTableName}.${key} = ${this.formatValue(value)}`;
          });
          onClause = onConditions.join(' AND ');
        }
        let joinStr = `${join.type} JOIN ${joinTableName} ON ${onClause}`;
        if (join.join && join.join.length > 0) {
          joinStr += ' ' + this.processJoinRecursive(join.join);
        }
        return joinStr;
      })
      .join(' ');
  }

  private getSQLOperator(operator: string): string {
    switch (operator) {
      case 'gt':
        return '>';
      case 'gte':
        return '>=';
      case 'lt':
        return '<';
      case 'lte':
        return '<=';
      case 'in':
        return 'IN';
      case 'not':
        return '!=';
      case 'eq':
        return '=';
      default:
        return '=';
    }
  }

  private buildWhereCondition(key: string, operator: string, value: any): string {
    this.assertSafeIdentifier(key, 'where column');
    const column = `${this.tableName}.${key}`;
    let values: any[];

    switch (operator) {
      case 'gt':
        return `${column} > ${this.formatValue(value)}`;
      case 'gte':
        return `${column} >= ${this.formatValue(value)}`;
      case 'lt':
        return `${column} < ${this.formatValue(value)}`;
      case 'lte':
        return `${column} <= ${this.formatValue(value)}`;
      case 'in':
        values = Array.isArray(value) ? value : [value];
        return `${column} IN (${values.map(v => this.formatValue(v)).join(', ')})`;
      case 'not':
        return `${column} != ${this.formatValue(value)}`;
      case 'eq':
        return `${column} = ${this.formatValue(value)}`;
      default:
        return `${column} = ${this.formatValue(value)}`;
    }
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'string') return `'${this.escapeSqlString(value)}'`;
    if (value instanceof Date) {
      const date = new Date(value);
      return `'${date.toISOString()}'`;
    }
    if (Array.isArray(value)) {
      return `(${value.map(v => this.formatValue(v)).join(', ')})`;
    }
    if (typeof value === 'object') return `'${this.escapeSqlString(JSON.stringify(value))}'`;
    return String(value);
  }

  private escapeSqlString(value: string): string {
    return value.replace(/'/g, "''");
  }

  insert(data: Partial<T> | Partial<T>[]): string {
    this.currentOperation = 'INSERT';
    const values = Array.isArray(data) ? data : [data];
    const columns = Object.keys(values[0]);
    columns.forEach(column => this.assertSafeIdentifier(column, 'insert column'));
    const valuesList = values.map(row => `(${columns.map(col => this.formatValue((row as any)[col])).join(', ')})`).join(', ');

    this.selectColumns = [`(${columns.join(', ')}) VALUES ${valuesList}`];
    return this.toString();
  }

  insertWithParams(data: Partial<T> | Partial<T>[]): { sql: string; params: any[] } {
    const values = Array.isArray(data) ? data : [data];
    const columns = Object.keys(values[0]);
    columns.forEach(col => this.assertSafeIdentifier(col, 'insert column'));
    const params: any[] = [];
    const placeholders = values
      .map(row => {
        const rowPlaceholders = columns
          .map(col => {
            params.push(this.toParamValue((row as any)[col]));
            return '?';
          })
          .join(', ');
        return `(${rowPlaceholders})`;
      })
      .join(', ');

    return {
      sql: `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES ${placeholders}`,
      params
    };
  }

  update(data: Partial<T>): string {
    this.currentOperation = 'UPDATE';
    const setClause = Object.entries(data)
      .map(([key, value]) => {
        this.assertSafeIdentifier(key, 'update column');
        return `${this.tableName}.${key} = ${this.formatValue(value)}`;
      })
      .join(', ');
    this.selectColumns = [setClause];
    return this.toString();
  }

  updateWithParams(data: Partial<T>): { sql: string; params: any[] } {
    const params: any[] = [];
    const setClause = Object.entries(data)
      .map(([key, value]) => {
        this.assertSafeIdentifier(key, 'update column');
        params.push(this.toParamValue(value));
        return `${this.tableName}.${key} = ?`;
      })
      .join(', ');

    const whereClause = this.conditions.length ? ` WHERE ${this.conditions.join(' AND ')}` : '';
    return {
      sql: `UPDATE ${this.tableName} SET ${setClause}${whereClause}`,
      params
    };
  }

  delete(options?: QueryOptions<T>): string {
    this.currentOperation = 'DELETE';
    this.processWhere(options?.where);
    this.processOr(options?.or);
    this.processJoin(options?.join as JoinOption<any>[]);
    this.processLimit(options?.take, options?.skip);
    return this.toString();
  }

  private toString(): string {
    switch (this.currentOperation) {
      case 'SELECT':
        return [
          `SELECT ${this.selectColumns.join(', ')}`,
          `FROM ${this.tableName}`,
          ...this.joins,
          this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : '',
          this.selectColumns.length > 1 ? `GROUP BY ${this.selectColumns.slice(1).join(', ')}` : '',
          this.orderByClause.length ? `ORDER BY ${this.orderByClause.join(', ')}` : '',
          this.limitClause,
          this.offsetClause
        ]
          .filter(Boolean)
          .join(' ');

      case 'INSERT':
        return `INSERT INTO ${this.tableName} ${this.selectColumns[0]}`;

      case 'UPDATE':
        return [
          `UPDATE ${this.tableName}`,
          `SET ${this.selectColumns[0]}`,
          this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : ''
        ]
          .filter(Boolean)
          .join(' ');

      case 'DELETE':
        return [`DELETE FROM ${this.tableName}`, this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : '']
          .filter(Boolean)
          .join(' ');

      default:
        return '';
    }
  }

  private toParamValue(value: any): any {
    if (value === undefined) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return value;
  }
}
