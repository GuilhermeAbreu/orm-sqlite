# @capacitor/orm-sqlite

Gerenciado de sql e banco para sqlite no capacitor

## Install

```bash
npm install @guilhermeabreu/capacitor-orm-sqlite"
npx cap sync
```

## API

<docgen-index>

* [`groupBy(...)`](#groupby)
* [`where(...)`](#where)
* [`whereJoin(...)`](#wherejoin)
* [`limit(...)`](#limit)
* [`offset(...)`](#offset)
* [`orderBy(...)`](#orderby)
* [`join(...)`](#join)
* [`leftJoin(...)`](#leftjoin)
* [`getQuery()`](#getquery)
* [`insert(...)`](#insert)
* [`update(...)`](#update)
* [`delete()`](#delete)
* [`createTable(...)`](#createtable)
* [`addColumn(...)`](#addcolumn)
* [`dropColumn(...)`](#dropcolumn)
* [`alterColumn(...)`](#altercolumn)
* [`rightJoin(...)`](#rightjoin)
* [`fullJoin(...)`](#fulljoin)
* [`distinct(...)`](#distinct)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### groupBy(...)

```typescript
groupBy<U>(asOrColumn: keyof T, columnCaseJoin?: keyof U | undefined) => this
```

| Param                | Type                 |
| -------------------- | -------------------- |
| **`asOrColumn`**     | <code>keyof T</code> |
| **`columnCaseJoin`** | <code>keyof U</code> |

**Returns:** <code>this</code>

--------------------


### where(...)

```typescript
where<K extends keyof T>(column: K, value: T[K], operator?: "=" | "<>" | "<" | ">" | "<=" | ">=" | undefined) => this
```

| Param          | Type                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| **`column`**   | <code>K</code>                                                           |
| **`value`**    | <code>T[K]</code>                                                        |
| **`operator`** | <code>'=' \| '&lt;&gt;' \| '&lt;' \| '&gt;' \| '&lt;=' \| '&gt;='</code> |

**Returns:** <code>this</code>

--------------------


### whereJoin(...)

```typescript
whereJoin<K extends keyof T, U>(tableNameOrColumnTableReference: IModelClassOrmSQlite<U> | K, column: keyof U, value: U[keyof U], operator: IQueryFilterOrmSQlite<T>['operator']) => this
```

| Param                                 | Type                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| **`tableNameOrColumnTableReference`** | <code>K \| <a href="#imodelclassormsqlite">IModelClassOrmSQlite</a>&lt;U&gt;</code> |
| **`column`**                          | <code>keyof U</code>                                                                |
| **`value`**                           | <code>U[keyof U]</code>                                                             |
| **`operator`**                        | <code>'=' \| '&lt;&gt;' \| '&lt;' \| '&gt;' \| '&lt;=' \| '&gt;='</code>            |

**Returns:** <code>this</code>

--------------------


### limit(...)

```typescript
limit(limit: number) => this
```

| Param       | Type                |
| ----------- | ------------------- |
| **`limit`** | <code>number</code> |

**Returns:** <code>this</code>

--------------------


### offset(...)

```typescript
offset(offset: number) => this
```

| Param        | Type                |
| ------------ | ------------------- |
| **`offset`** | <code>number</code> |

**Returns:** <code>this</code>

--------------------


### orderBy(...)

```typescript
orderBy<U>(asOrColumn: keyof T, order: ITypeOrderBySql, columnCaseJoin?: keyof U | undefined) => this
```

| Param                | Type                                                        |
| -------------------- | ----------------------------------------------------------- |
| **`asOrColumn`**     | <code>keyof T</code>                                        |
| **`order`**          | <code><a href="#itypeorderbysql">ITypeOrderBySql</a></code> |
| **`columnCaseJoin`** | <code>keyof U</code>                                        |

**Returns:** <code>this</code>

--------------------


### join(...)

```typescript
join<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K) => this
```

| Param            | Type                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| **`tableName`**  | <code><a href="#imodelclassormsqlite">IModelClassOrmSQlite</a>&lt;U&gt;</code> |
| **`foreignKey`** | <code>K</code>                                                                 |
| **`primaryKey`** | <code>keyof U</code>                                                           |
| **`as`**         | <code>K</code>                                                                 |

**Returns:** <code>this</code>

--------------------


### leftJoin(...)

```typescript
leftJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K) => this
```

| Param            | Type                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| **`tableName`**  | <code><a href="#imodelclassormsqlite">IModelClassOrmSQlite</a>&lt;U&gt;</code> |
| **`foreignKey`** | <code>K</code>                                                                 |
| **`primaryKey`** | <code>keyof U</code>                                                           |
| **`as`**         | <code>K</code>                                                                 |

**Returns:** <code>this</code>

--------------------


### getQuery()

```typescript
getQuery() => string
```

**Returns:** <code>string</code>

--------------------


### insert(...)

```typescript
insert(values: Partial<T> | Partial<T>[], returnValues?: boolean | undefined) => string
```

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`values`**       | <code><a href="#partial">Partial</a>&lt;T&gt; \| <a href="#partial">Partial</a>&lt;T&gt;[]</code> |
| **`returnValues`** | <code>boolean</code>                                                                              |

**Returns:** <code>string</code>

--------------------


### update(...)

```typescript
update(values: Partial<T>, returnValues?: boolean | undefined) => string
```

| Param              | Type                                                 |
| ------------------ | ---------------------------------------------------- |
| **`values`**       | <code><a href="#partial">Partial</a>&lt;T&gt;</code> |
| **`returnValues`** | <code>boolean</code>                                 |

**Returns:** <code>string</code>

--------------------


### delete()

```typescript
delete() => string
```

**Returns:** <code>string</code>

--------------------


### createTable(...)

```typescript
createTable(columns: IColumnTypeOrmSQlite<T>[]) => string
```

| Param         | Type                                                                             |
| ------------- | -------------------------------------------------------------------------------- |
| **`columns`** | <code><a href="#icolumntypeormsqlite">IColumnTypeOrmSQlite</a>&lt;T&gt;[]</code> |

**Returns:** <code>string</code>

--------------------


### addColumn(...)

```typescript
addColumn(column: IColumnTypeOrmSQlite<T>) => string
```

| Param        | Type                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| **`column`** | <code><a href="#icolumntypeormsqlite">IColumnTypeOrmSQlite</a>&lt;T&gt;</code> |

**Returns:** <code>string</code>

--------------------


### dropColumn(...)

```typescript
dropColumn(columnName: keyof T) => string
```

| Param            | Type                 |
| ---------------- | -------------------- |
| **`columnName`** | <code>keyof T</code> |

**Returns:** <code>string</code>

--------------------


### alterColumn(...)

```typescript
alterColumn(column: IColumnTypeOrmSQlite<T>) => string
```

| Param        | Type                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| **`column`** | <code><a href="#icolumntypeormsqlite">IColumnTypeOrmSQlite</a>&lt;T&gt;</code> |

**Returns:** <code>string</code>

--------------------


### rightJoin(...)

```typescript
rightJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K) => this
```

| Param            | Type                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| **`tableName`**  | <code><a href="#imodelclassormsqlite">IModelClassOrmSQlite</a>&lt;U&gt;</code> |
| **`foreignKey`** | <code>K</code>                                                                 |
| **`primaryKey`** | <code>keyof U</code>                                                           |
| **`as`**         | <code>K</code>                                                                 |

**Returns:** <code>this</code>

--------------------


### fullJoin(...)

```typescript
fullJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, foreignKey: K, primaryKey: keyof U, as: K) => this
```

| Param            | Type                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| **`tableName`**  | <code><a href="#imodelclassormsqlite">IModelClassOrmSQlite</a>&lt;U&gt;</code> |
| **`foreignKey`** | <code>K</code>                                                                 |
| **`primaryKey`** | <code>keyof U</code>                                                           |
| **`as`**         | <code>K</code>                                                                 |

**Returns:** <code>this</code>

--------------------


### distinct(...)

```typescript
distinct<K extends keyof T, U>(asOrColumn: K, columnCaseJoin?: keyof U | undefined) => this
```

| Param                | Type                 |
| -------------------- | -------------------- |
| **`asOrColumn`**     | <code>K</code>       |
| **`columnCaseJoin`** | <code>keyof U</code> |

**Returns:** <code>this</code>

--------------------


### Interfaces


#### IQueryFilterOrmSQlite

| Prop           | Type                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| **`column`**   | <code>keyof T</code>                                                     |
| **`value`**    | <code>any</code>                                                         |
| **`operator`** | <code>'=' \| '&lt;&gt;' \| '&lt;' \| '&gt;' \| '&lt;=' \| '&gt;='</code> |
| **`isHaving`** | <code>boolean</code>                                                     |


#### IModelClassOrmSQlite

| Prop             | Type                |
| ---------------- | ------------------- |
| **`entityName`** | <code>string</code> |


### Type Aliases


#### ITypeOrderBySql

<code>'ASC' | "DESC"</code>


#### Partial

Make all properties in T optional

<code>{ [P in keyof T]?: T[P]; }</code>


#### IColumnTypeOrmSQlite

<code>{ [K in keyof T]: { name: K; type: 'INTEGER' | 'TEXT' | 'BOOLEAN' | 'DATE'; primaryKey?: boolean; unique?: boolean; notNull?: boolean; defaultValue?: any; autoIncremente?: boolean; }; }[keyof T]</code>

</docgen-api>
