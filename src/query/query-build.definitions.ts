
export interface IQueryFilterOrmSQlite<T> {
    column: keyof T;
    value: any;
    operator: '=' | '<>' | '<' | '>' | '<=' | '>=';
    isHaving?: boolean;
    type: 'AND' | 'OR';
    isIn?: boolean;
}

export interface IQueryOptionsOrmSQlite<T = any> {
    limit?: number;
    offset?: number;
    orderBy?: string[];
    distinct?: T[]
}

export interface IJoinClauseOrmSQlite<T = any, U = any, J = any> {
    tableName: string;
    foreignKey: keyof T;
    primaryKey: keyof U | J,
    as: keyof T,
    class: U
    returnValues: boolean,
    tableJoin?: string
    classJoin?: J
}
export interface leftJoinClauseOrmSQlite<T = any, U = any, J = any> {
    tableName: string;
    foreignKey: keyof T;
    primaryKey: keyof U | J,
    as: keyof T,
    class: U
    returnValues: boolean,
    tableJoin?: string
    classJoin?: J
}

export interface ITableColumnOrmSQlite {
    name: string;
    type: string;
    primaryKey?: boolean;
    unique?: boolean;
    notNull?: boolean;
    defaultValue?: any;
    autoIncremente?: boolean;
}

export type IColumnTypeOrmSQlite<T> = {
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


export type IColumnOrmSQlite = {
    type: 'INTEGER' | 'TEXT' | 'BOOLEAN' | 'DATE';
    primaryKey?: boolean;
    unique?: boolean;
    notNull?: boolean;
    defaultValue?: any;
    autoIncremente?: boolean;
};


export type OrderByDirection = 'asc' | 'desc';

export type WhereOperator<T> = {
    gt?: T;
    gte?: T;
    lt?: T;
    lte?: T;
    in?: T | T[];
    not?: T;
    eq?: T;
};

export type WhereConditionValue<T> = T extends Date
    ? WhereOperator<T> | null | undefined
    : T | WhereOperator<T> | null | undefined;

export type WhereCondition<T> = {
    [K in keyof T]?: WhereConditionValue<T[K]>;
};

export type JoinOn<M> = WhereCondition<M> | string | string[];

export type JoinOption<M, J = any> = {
    table: IModelClassOrmSQlite<M>;
    type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
    on: JoinOn<M>;
    join?: JoinOption<J>[];
};

export interface QueryOptions<T, J = any> {
    where?: WhereCondition<T>;
    or?: WhereCondition<T>[];
    orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
    take?: number;
    skip?: number;
    select?: (keyof T)[];
    groupBy?: (keyof T)[];
    having?: WhereCondition<T>;
    join?: JoinOption<J>[];
}


export type ITypeOrderBySql = 'ASC' | "DESC"


export interface IModelClassOrmSQlite<T> {
    new(...args: any[]): T;
    entityName?: string;
}


export interface IQueryBuildOrmSQlite<T = any> {
    groupBy<U>(asOrColumn: keyof T, columnCaseJoin?: keyof U): this ;
    where<K extends keyof T>(column: K, value: T[K], operator?: IQueryFilterOrmSQlite<T>['operator']): this;
    whereJoin<K extends keyof T, U>(tableNameOrColumnTableReference: IModelClassOrmSQlite<U> | K, column: keyof U, value: U[keyof U], operator: IQueryFilterOrmSQlite<T>['operator']): this;
    limit(limit: number): this;
    offset(offset: number): this;
    orderBy<U>(asOrColumn: keyof T, order: ITypeOrderBySql, columnCaseJoin?: keyof U): this 
    JoiOnJoin<U, J>(tableName: IModelClassOrmSQlite<U>, primaryKey: keyof U, tableJoin: IModelClassOrmSQlite<J>, foreignKey: keyof J, as: keyof U): this
    join<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K): this;
    leftJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K): this;
    getQuery(): string;
    insert(values: Partial<T> | Partial<T>[], returnValues?: boolean): string;
    update(values: Partial<T>, returnValues?: boolean): string;
    delete(): string;
    createTable(columns: IColumnTypeOrmSQlite<T>[]): string;
    addColumn(column: IColumnTypeOrmSQlite<T>): string;
    dropColumn(columnName: keyof T): string;
    alterColumn(column: IColumnTypeOrmSQlite<T>): string;
    rightJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K): this;
    fullJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K): this;
    distinct<K extends keyof T, U>(asOrColumn: K, columnCaseJoin?: keyof U): this
}