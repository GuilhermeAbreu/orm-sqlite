
export interface IQueryFilter<T> {
    column: keyof T;
    value: any;
    operator: '=' | '<>' | '<' | '>' | '<=' | '>=';
}

export interface IQueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
}

export interface IJoinClause<T = any, U = any> {
    tableName: string;
    foreignKey: keyof T;
    primaryKey: keyof U,
    as: keyof T,
    class: U
}
export interface leftJoinClause<T = any, U = any> {
    tableName: string;
    foreignKey: keyof T;
    primaryKey: keyof U,
    as: keyof T, class: U
}

export interface ITableColumn {
    name: string;
    type: string;
    primaryKey?: boolean;
    unique?: boolean;
    notNull?: boolean;
    defaultValue?: any;
    autoIncremente?: boolean;
}

export type IColumnType<T> = {
    [K in keyof T]: {
        name: K;
        type: 'INTEGER' | 'TEXT' | 'BOOLEAN' | 'DATE';
        primaryKey?: boolean;
        unique?: boolean;
        notNull?: boolean;
        defaultValue?: any;
        autoIncremente?: boolean;
    };
}[keyof T];


export type IColumn = {
    type: 'INTEGER' | 'TEXT' | 'BOOLEAN' | 'DATE';
    primaryKey?: boolean;
    unique?: boolean;
    notNull?: boolean;
    defaultValue?: any;
    autoIncremente?: boolean;
};


export interface IModelClass<T> {
    new(...args: any[]): T;
    entityName?: string;
}


export interface IQueryBuild<T = any> {
    groupBy<K extends keyof T>(...columns: K[]): this;
    where<K extends keyof T>(column: K, value: T[K], operator?: IQueryFilter<T>['operator']): this;
    whereJoin<K extends keyof T, U>(tableName: IModelClass<U>, column: K, value: T[K], operator?: IQueryFilter<T>['operator']): this;
    limit(limit: number): this;
    offset(offset: number): this;
    orderBy<K extends keyof T>(column: K, order?: IQueryOptions['order']): this;
    join<K extends keyof T, U>(tableName: IModelClass<U>, foreignKey: K, primaryKey: keyof U, as: K): this;
    leftJoin<K extends keyof T, U>(tableName: IModelClass<U>, foreignKey: K, primaryKey: keyof U, as: K): this;
    getQuery(): string;
    insert(values: Partial<T> | Partial<T>[]): string;
    update(values: Partial<T>): string;
    delete(): string;
    createTable(columns: IColumnType<T>[]): string;
    addColumn(column: IColumnType<T>): string;
    dropColumn(columnName: keyof T): string;
    alterColumn(column: IColumnType<T>): string;
}