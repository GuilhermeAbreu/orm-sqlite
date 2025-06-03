import type { IModelClassOrmSQlite } from './query-build.definitions';

type OrderByDirection = 'asc' | 'desc';

type WhereOperator<T> = {
    gt?: T;
    gte?: T;
    lt?: T;
    lte?: T;
    in?: T | T[];
    not?: T;
    eq?: T;
};

type WhereConditionValue<T> = T extends Date
    ? WhereOperator<T> | null | undefined
    : T | WhereOperator<T> | null | undefined;

type WhereCondition<T> = {
    [K in keyof T]?: WhereConditionValue<T[K]>;
};

interface QueryOptions<T> {
    where?: WhereCondition<T>;
    or?: WhereCondition<T>[];
    orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
    take?: number;
    skip?: number;
    select?: (keyof T)[];
    groupBy?: (keyof T)[];
    having?: WhereCondition<T>;
    join?: {
        table: string;
        type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
        on: WhereCondition<T>;
    }[];
}

class NewQueryBuilder<T = any> {
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

    private getTableName(modelClass: IModelClassOrmSQlite<T>): string {
        const className = modelClass.entityName;
        if (!className) {
            throw new Error('Nome da tabela não informada ' + modelClass);
        }
        return className.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

    findMany(options?: QueryOptions<T>): string {
        this.currentOperation = 'SELECT';
        this.selectColumns = options?.select?.map(col => `${this.tableName}.${String(col)}`) || ['*'];
        this.processWhere(options?.where);
        if (options?.or) {
            this.processOr(options.or);
        }
        this.processOrderBy(options?.orderBy);
        this.processLimit(options?.take, options?.skip);
        this.processGroupBy(options?.groupBy);
        this.processHaving(options?.having);
        this.processJoin(options?.join);
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
                        const operator = Object.keys(value)[0];
                        const operatorValue = (value as any)[operator];
                        return this.buildWhereCondition(key, operator, operatorValue);
                    }
                    return `${this.tableName}.${key} = ${this.formatValue(value)}`;
                });
                return `(${conditions.join(' AND ')})`;
            });
            this.conditions.push(orConditions.join(' OR '));
            return;
        }

        const conditions = Object.entries(where).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                const operator = Object.keys(value)[0];
                const operatorValue = (value as any)[operator];
                return this.buildWhereCondition(key, operator, operatorValue);
            }
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
                return `${this.tableName}.${key} = ${this.formatValue(value)}`;
            });
            return `(${conditions.join(' AND ')})`;
        });
        this.conditions.push(orConditions.join(' OR '));
    }

    private processOrderBy(orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>): void {
        if (!orderBy) return;

        const orders = Object.entries(orderBy).map(
            ([key, direction]) => `${this.tableName}.${key} ${(direction as OrderByDirection).toUpperCase()}`
        );
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
        this.selectColumns = groupBy.map(col => `${this.tableName}.${String(col)}`);
    }

    private processHaving(having?: WhereCondition<T>): void {
        if (!having) return;
        this.processWhere(having);
    }

    private processJoin(joins?: QueryOptions<T>['join']): void {
        if (!joins) return;
        this.joins = joins.map(join => {
            const onConditions = Object.entries(join.on).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    const operator = Object.keys(value)[0];
                    const operatorValue = (value as any)[operator];
                    return this.buildWhereCondition(key, operator, operatorValue);
                }
                return `${this.tableName}.${key} = ${this.formatValue(value)}`;
            });
            return `${join.type} JOIN ${join.table} ON ${onConditions.join(' AND ')}`;
        });
    }

    private buildWhereCondition(key: string, operator: string, value: any): string {
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
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (value instanceof Date) {
            const date = new Date(value);
            return `'${date.toISOString()}'`;
        }
        if (Array.isArray(value)) {
            return `(${value.map(v => this.formatValue(v)).join(', ')})`;
        }
        if (typeof value === 'object') return `'${JSON.stringify(value)}'`;
        return String(value);
    }

    insert(data: Partial<T> | Partial<T>[]): string {
        this.currentOperation = 'INSERT';
        const values = Array.isArray(data) ? data : [data];
        const columns = Object.keys(values[0]);
        const valuesList = values.map(row =>
            `(${columns.map(col => this.formatValue((row as any)[col])).join(', ')})`
        ).join(', ');

        this.selectColumns = [`(${columns.join(', ')}) VALUES ${valuesList}`];
        return this.toString();
    }

    update(data: Partial<T>): string {
        this.currentOperation = 'UPDATE';
        const setClause = Object.entries(data)
            .map(([key, value]) => `${this.tableName}.${key} = ${this.formatValue(value)}`)
            .join(', ');
        this.selectColumns = [setClause];
        return this.toString();
    }

    delete(options?: QueryOptions<T>): string {
        this.currentOperation = 'DELETE';
        this.processWhere(options?.where);
        return this.toString();
    }

    toString(): string {
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
                ].filter(Boolean).join(' ');

            case 'INSERT':
                return `INSERT INTO ${this.tableName} ${this.selectColumns[0]}`;

            case 'UPDATE':
                return [
                    `UPDATE ${this.tableName}`,
                    `SET ${this.selectColumns[0]}`,
                    this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : ''
                ].filter(Boolean).join(' ');

            case 'DELETE':
                return [
                    `DELETE FROM ${this.tableName}`,
                    this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : ''
                ].filter(Boolean).join(' ');

            default:
                return '';
        }
    }
}

export { NewQueryBuilder, QueryOptions, WhereCondition, WhereConditionValue };
