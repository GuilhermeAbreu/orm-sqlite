# @capacitor/orm-sqlite

Gerenciado de sql e banco para sqlite no capacitor

## Install

```bash
npm install @capacitor/orm-sqlite
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
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### groupBy(...)

```typescript
groupBy<K extends keyof T>(...columns: K[]) => this
```

| Param         | Type             |
| ------------- | ---------------- |
| **`columns`** | <code>K[]</code> |

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
whereJoin<K extends keyof T, U>(tableName: IModelClassOrmSQlite<U>, column: K, value: T[K], operator?: "=" | "<>" | "<" | ">" | "<=" | ">=" | undefined) => this
```

| Param           | Type                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| **`tableName`** | <code><a href="#imodelclassormsqlite">IModelClassOrmSQlite</a>&lt;U&gt;</code> |
| **`column`**    | <code>K</code>                                                                 |
| **`value`**     | <code>T[K]</code>                                                              |
| **`operator`**  | <code>'=' \| '&lt;&gt;' \| '&lt;' \| '&gt;' \| '&lt;=' \| '&gt;='</code>       |

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
orderBy<K extends keyof T>(column: K, order?: IQueryOptionsOrmSQlite['order']) => this
```

| Param        | Type                         |
| ------------ | ---------------------------- |
| **`column`** | <code>K</code>               |
| **`order`**  | <code>'ASC' \| 'DESC'</code> |

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
insert(values: Partial<T> | Partial<T>[]) => string
```

| Param        | Type                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **`values`** | <code><a href="#partial">Partial</a>&lt;T&gt; \| <a href="#partial">Partial</a>&lt;T&gt;[]</code> |

**Returns:** <code>string</code>

--------------------


### update(...)

```typescript
update(values: Partial<T>) => string
```

| Param        | Type                                                 |
| ------------ | ---------------------------------------------------- |
| **`values`** | <code><a href="#partial">Partial</a>&lt;T&gt;</code> |

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


### Interfaces


#### IQueryFilterOrmSQlite

| Prop           | Type                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| **`column`**   | <code>keyof T</code>                                                     |
| **`value`**    | <code>any</code>                                                         |
| **`operator`** | <code>'=' \| '&lt;&gt;' \| '&lt;' \| '&gt;' \| '&lt;=' \| '&gt;='</code> |


#### IModelClassOrmSQlite

| Prop             | Type                |
| ---------------- | ------------------- |
| **`entityName`** | <code>string</code> |


#### IQueryOptionsOrmSQlite

| Prop          | Type                         |
| ------------- | ---------------------------- |
| **`limit`**   | <code>number</code>          |
| **`offset`**  | <code>number</code>          |
| **`orderBy`** | <code>string</code>          |
| **`order`**   | <code>'ASC' \| 'DESC'</code> |


### Type Aliases


#### Partial

Make all properties in T optional

<code>{ [P in keyof T]?: T[P]; }</code>


#### IColumnTypeOrmSQlite

<code>{ [K in keyof T]: { name: K; type: 'INTEGER' | 'TEXT' | 'BOOLEAN' | 'DATE'; primaryKey?: boolean; unique?: boolean; notNull?: boolean; defaultValue?: any; autoIncremente?: boolean; }; }[keyof T]</code>

</docgen-api>
