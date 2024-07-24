import { getPrimaryKey, isColumn, isColunaRelacionamento, isManyToMany, isOneToMany } from '../decoratiors/decoratiors.orm';
import { IColumnType, IJoinClause, IModelClass, IQueryBuild, IQueryFilter, IQueryOptions, leftJoinClause } from './query-build.definitions';

export class QueryBuild<T = any> implements IQueryBuild<T> {

    private tableName: string;
    private filters: IQueryFilter<T>[];
    private filtersJoin: IQueryFilter<T>[];
    private options: IQueryOptions;
    private joinClauses: IJoinClause[];
    private leftJoinClauses: leftJoinClause[];
    private groupByColumns: (keyof T)[];
    private classModel: IModelClass<T>;

    constructor(modelClass: IModelClass<T>) {
        this.tableName = this.getClassName(modelClass).toLowerCase();
        this.classModel = modelClass;
        this.filters = [];
        this.filtersJoin = [];
        this.options = {};
        this.joinClauses = [];
        this.leftJoinClauses = [];
        this.groupByColumns = [];
      }
    
      groupBy<K extends keyof T>(...columns: K[]): this {
        this.groupByColumns.push(...columns);
        return this;
      }
    
      private getClassName<T>(modelClass: IModelClass<T>): string {
        const className = modelClass.entityName;
    
        if (!className) {
          throw new Error('Nome da tabela não informada ' + modelClass)
        }
    
        return className.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      }
    
      where<K extends keyof T>(column: K & (string extends K ? never : keyof T), value: T[K], operator: IQueryFilter<T>['operator'] = '='): this {
    
        if (!isColumn(this.classModel.prototype, column as string)) {
          throw new Error(`Column '${column as string}' does not exist or is not decorated as @Column.`);
        }
    
    
        this.filters.push({ column, value, operator });
        return this;
      }
    
      whereJoin<K extends keyof T, U>(tableName: IModelClass<U>, column: K, value: T[K], operator: IQueryFilter<T>['operator'] = '='): this {
        const tableNameStr = this.getClassName(tableName).toLowerCase();
        const qualifiedColumn = String(`${tableNameStr}.${column.toString()}`) as keyof T; // Conversão correta para string
    
        this.filtersJoin.push({ column: qualifiedColumn, value, operator });
        return this;
      }
    
      limit(limit: number) {
        this.options.limit = limit;
        return this;
      }
    
      offset(offset: number) {
        this.options.offset = offset;
        return this;
      }
    
      orderBy(column: keyof T, order: IQueryOptions['order'] = 'ASC') {
        this.options.orderBy = String(column);
        this.options.order = order;
        return this;
      }
    
      join<K extends keyof T, U>(tableName: IModelClass<U>, foreignKey: K, primaryKey: keyof U, as: K): this {
        const tableNameStr = this.getClassName(tableName).toLowerCase();
        this.joinClauses.push({
          tableName: tableNameStr,
          foreignKey,
          primaryKey,
          as,
          class: tableName
        });
        return this;
      }
    
      leftJoin<K extends keyof T, U>(tableName: IModelClass<U>, foreignKey: K, primaryKey: keyof U, as: K): this {
        const tableNameStr = this.getClassName(tableName).toLowerCase();
        this.leftJoinClauses.push({
          tableName: tableNameStr,
          foreignKey,
          primaryKey,
          as,
          class: tableName
        });
        return this;
      }
    
      getQuery(): string {
        const selectColumns = [`${this.tableName}.*`];
        const jsonSelects: string[] = [];
    
        this.joinClauses.forEach(joinClause => {
          const joinClassInstance = new joinClause.class({});
          const joinClassKeys = Object.keys(joinClassInstance) as (keyof any)[];
    
          const joinSelect = joinClassKeys.map(key => {
    
            if (!this.isRelationalField(key, joinClause.class)) {
              return `'${key as string}', ${joinClause.as as string}.${key as string}`;
            }
            return '';
          }).filter(Boolean).join(', ');
    
          if (joinSelect) {
    
            if (isManyToMany(this.classModel.prototype, joinClause.as as string) || isOneToMany(this.classModel.prototype, joinClause.as as string)) {
              jsonSelects.push(`
              CASE
                WHEN ${joinClause.as as string}.${getPrimaryKey(joinClassInstance) as string} IS NOT NULL THEN
                 json_group_array(
                    json_object(
                    ${joinSelect}
                    )
                  )
                  ELSE NULL
              END AS ${joinClause.as as string}
              `);
              return;
            }
    
            jsonSelects.push(`
               CASE
                WHEN ${joinClause.as as string}.${getPrimaryKey(joinClassInstance) as string} IS NOT NULL THEN
                  json_object(
                  ${joinSelect}
                  )
                  ELSE NULL
              END AS ${joinClause.as as string}
            `);
          }
        });
    
        this.leftJoinClauses.forEach(joinClause => {
          const joinClassInstance = new joinClause.class({});
          const joinClassKeys = Object.keys(joinClassInstance) as (keyof any)[];
    
          const joinSelect = joinClassKeys.map(key => {
            if (!this.isRelationalField(key, joinClause.class)) {
              return `'${key as string}', ${joinClause.as as string}.${key as string}`;
            }
            return '';
          }).filter(Boolean).join(', ');
    
          if (joinSelect) {
    
            if (isManyToMany(this.classModel.prototype, joinClause.as as string) || isOneToMany(this.classModel.prototype, joinClause.as as string)) {
              jsonSelects.push(`
              CASE
                WHEN ${joinClause.as as string}.${getPrimaryKey(joinClassInstance) as string} IS NOT NULL THEN
                 json_group_array(
                    json_object(
                    ${joinSelect}
                    )
                  )
                  ELSE NULL
              END AS ${joinClause.as as string}
              `);
              return;
            }
    
            jsonSelects.push(`
               CASE
                WHEN ${joinClause.as as string}.${getPrimaryKey(joinClassInstance) as string} IS NOT NULL THEN
                  json_object(
                  ${joinSelect}
                  )
                  ELSE NULL
              END AS ${joinClause.as as string}
            `);
          }
        });
    
        let query = `SELECT ${selectColumns.join(', ')}`;
    
        if (jsonSelects.length > 0) {
          query += `, ${jsonSelects.join(', ')}`;
        }
    
        query += ` FROM ${this.tableName}`;
    
        if (this.joinClauses.length > 0) {
          this.joinClauses.forEach(joinClause => {
            query += ` INNER JOIN ${joinClause.tableName} ${joinClause.as as string} ON ${this.tableName}.${joinClause.foreignKey as string} = ${joinClause.as as string}.${joinClause.primaryKey as string}`;
          });
        }
    
        if (this.leftJoinClauses.length > 0) {
          this.leftJoinClauses.forEach(joinClause => {
            query += ` LEFT JOIN ${joinClause.tableName} ${joinClause.as as string} ON ${this.tableName}.${joinClause.foreignKey as string} = ${joinClause.as as string}.${joinClause.primaryKey as string}`;
          });
        }
    
        if (this.filters.length > 0) {
          query += ' WHERE ';
          query += this.filters.map(filter => `${this.tableName}.${filter.column as string} ${filter.operator} ${this.formatValue(filter.value)}`).join(' AND ');
        }
    
        if (this.filtersJoin.length > 0) {
          query += ' WHERE ';
          query += this.filtersJoin.map(filter => `${filter.column as string} ${filter.operator} ${this.formatValue(filter.value)}`).join(' AND ');
        }
    
        if (this.groupByColumns.length > 0) {
          query += ' GROUP BY ';
          query += this.groupByColumns.map(column => `${this.tableName}.${String(column)}`).join(', ');
        }
    
        if (this.options.orderBy) {
          query += ` ORDER BY ${this.options.orderBy} ${this.options.order}`;
        }
    
        if (this.options.limit !== undefined) {
          query += ` LIMIT ${this.options.limit}`;
        }
    
        if (this.options.offset !== undefined) {
          query += ` OFFSET ${this.options.offset}`;
        }
    
        return query;
      }
    
      private formatValue(value: any): string {
        if (value instanceof Date) {
          return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
        } else if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          return `${value}`;
        } else if (value === null || value === undefined) {
          return 'NULL';
        }
        return `'${value}'`;
      }
    
    
      private isRelationalField<U = T>(value: any, classModel?: IModelClass<U>): boolean {
        if (value instanceof Date) {
          return false;
        }
        return isColunaRelacionamento(classModel?.prototype ?? this.classModel.prototype, value);
      }
    
      insert(values: Partial<T> | Partial<T>[]): string {
        if (!Array.isArray(values)) {
          values = [values];
        }
    
        if (values.length === 0) {
          return '';
        }
    
        // Filtrar campos relacionais e campos com valor undefined
        const filteredKeys = (Object.keys(values[0]) as (keyof T)[]).filter(key =>
          !this.isRelationalField(key)
        );
        const columns = filteredKeys.join(', ');
    
        const rows = (values as Partial<T>[]).map(value => {
          const columnValues = filteredKeys.map(key => this.formatValue((value as any)[key])).join(', ');
          return `(${columnValues})`;
        }).join(', ');
    
        return `INSERT INTO ${this.tableName} (${columns}) VALUES ${rows}`;
      }
    
      update(values: Partial<T>): string {
    
        const chavePrimaria = getPrimaryKey(this.classModel.prototype);
    
        delete values[chavePrimaria as keyof T];
    
        const setClause = Object.entries(values).map(([key, value]) => {
          if (!this.isRelationalField(key)) {
            return `${key} = ${this.formatValue(value)}`
          }
          return '';
        }).filter(Boolean).join(', ');
    
        let query = `UPDATE ${this.tableName} SET ${setClause}`;
    
        if (this.filters.length > 0) {
          query += ' WHERE ';
          query += this.filters.map(filter => `${filter.column as string} ${filter.operator} ${this.formatValue(filter.value)}`).join(' AND ');
        }
    
        return query;
      }
    
      delete(): string {
        let query = `DELETE FROM ${this.tableName}`;
    
        if (this.filters.length > 0) {
          query += ' WHERE ';
          query += this.filters.map(filter => `${filter.column as string} ${filter.operator} ${this.formatValue(filter.value)}`).join(' AND ');
        }
    
        return query;
      }
    
      createTable(columns: IColumnType<T>[]): string {
        const columnDefinitions = columns.map(column => {
          let definition = `${column.name as string} ${column.type}`;
    
          if (column.primaryKey) {
            definition += ' PRIMARY KEY';
          }
    
          if (column.autoIncremente) {
            definition += ` AUTOINCREMENT`
          }
    
          if (column.unique) {
            definition += ' UNIQUE';
          }
    
          if (column.notNull) {
            definition += ' NOT NULL';
          }
    
          if (column.defaultValue !== undefined) {
            definition += ` DEFAULT ${this.formatValue(column.defaultValue)}`;
          }
    
          return definition;
        });
    
        return `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columnDefinitions.join(', ')})`;
      }
    
      addColumn(column: IColumnType<T>): string {
        let columnDefinition = `${column.name as string} ${column.type}`;
        if (column.primaryKey) {
          columnDefinition += ' PRIMARY KEY';
        }
        if (column.unique) {
          columnDefinition += ' UNIQUE';
        }
        if (column.notNull) {
          columnDefinition += ' NOT NULL';
        }
        if (column.defaultValue !== undefined) {
          columnDefinition += ` DEFAULT ${this.formatValue(column.defaultValue)}`;
        }
        if (column.autoIncremente) {
          columnDefinition += ' AUTOINCREMENT';
        }
    
        return `ALTER TABLE ${this.tableName} ADD COLUMN ${columnDefinition}`;
      }
    
      dropColumn(columnName: keyof T): string {
        return `ALTER TABLE ${this.tableName} DROP COLUMN ${String(columnName)}`;
      }
    
      alterColumn(column: IColumnType<T>): string {
        let columnDefinition = `${column.name as string} ${column.type}`;
        if (column.primaryKey) {
          columnDefinition += ' PRIMARY KEY';
        }
        if (column.unique) {
          columnDefinition += ' UNIQUE';
        }
        if (column.notNull) {
          columnDefinition += ' NOT NULL';
        }
        if (column.defaultValue !== undefined) {
          columnDefinition += ` DEFAULT ${this.formatValue(column.defaultValue)}`;
        }
        if (column.autoIncremente) {
          columnDefinition += ' AUTOINCREMENT';
        }
    
        return `ALTER TABLE ${this.tableName} ALTER COLUMN ${columnDefinition}`;
      }
}