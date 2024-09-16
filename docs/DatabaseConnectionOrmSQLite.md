# @capacitor/orm-sqlite

Gerenciado de sql e banco para sqlite no capacitor

## Install

```bash
npm install @guilhermeabreu/capacitor-orm-sqlite"
npx cap sync
```

## API

<docgen-index>

* [`setConfig(...)`](#setconfig)
* [`isOpen()`](#isopen)
* [`createOrReconnectConnection()`](#createorreconnectconnection)
* [`closeDB()`](#closedb)
* [`beginTransaction()`](#begintransaction)
* [`commitTransaction()`](#committransaction)
* [`rollbackTransaction()`](#rollbacktransaction)
* [`execute(...)`](#execute)
* [`query(...)`](#query)
* [`getCurrentDBVersion()`](#getcurrentdbversion)
* [`updateDBVersion(...)`](#updatedbversion)
* [`recreateDatabase(...)`](#recreatedatabase)
* [`runMigrationsIfNeeded(...)`](#runmigrationsifneeded)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### setConfig(...)

```typescript
setConfig(config: Partial<IDatabaseConfig>) => void
```

| Param        | Type                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **`config`** | <code><a href="#partial">Partial</a>&lt;<a href="#idatabaseconfig">IDatabaseConfig</a>&gt;</code> |

--------------------


### isOpen()

```typescript
isOpen() => Promise<boolean>
```

**Returns:** <code>Promise&lt;boolean&gt;</code>

--------------------


### createOrReconnectConnection()

```typescript
createOrReconnectConnection() => Promise<SQLiteDBConnection>
```

**Returns:** <code>Promise&lt;SQLiteDBConnection&gt;</code>

--------------------


### closeDB()

```typescript
closeDB() => Promise<void>
```

--------------------


### beginTransaction()

```typescript
beginTransaction() => Promise<void>
```

--------------------


### commitTransaction()

```typescript
commitTransaction() => Promise<void>
```

--------------------


### rollbackTransaction()

```typescript
rollbackTransaction() => Promise<void>
```

--------------------


### execute(...)

```typescript
execute<T = any>(sql: string) => Promise<IReturnExecuteQuery<T>>
```

| Param     | Type                |
| --------- | ------------------- |
| **`sql`** | <code>string</code> |

**Returns:** <code>Promise&lt;<a href="#ireturnexecutequery">IReturnExecuteQuery</a>&lt;T&gt;&gt;</code>

--------------------


### query(...)

```typescript
query<T = any>(sql: string) => Promise<T[]>
```

| Param     | Type                |
| --------- | ------------------- |
| **`sql`** | <code>string</code> |

**Returns:** <code>Promise&lt;T[]&gt;</code>

--------------------


### getCurrentDBVersion()

```typescript
getCurrentDBVersion() => Promise<number | undefined>
```

**Returns:** <code>Promise&lt;number&gt;</code>

--------------------


### updateDBVersion(...)

```typescript
updateDBVersion(newVersion: number) => Promise<void>
```

| Param            | Type                |
| ---------------- | ------------------- |
| **`newVersion`** | <code>number</code> |

--------------------


### recreateDatabase(...)

```typescript
recreateDatabase(migration: IMigrationDatabaseOrmSQLite[]) => Promise<void>
```

| Param           | Type                                       |
| --------------- | ------------------------------------------ |
| **`migration`** | <code>IMigrationDatabaseOrmSQLite[]</code> |

--------------------


### runMigrationsIfNeeded(...)

```typescript
runMigrationsIfNeeded(migrations: IMigrationDatabaseOrmSQLite[]) => Promise<void>
```

| Param            | Type                                       |
| ---------------- | ------------------------------------------ |
| **`migrations`** | <code>IMigrationDatabaseOrmSQLite[]</code> |

--------------------


### Interfaces


#### IDatabaseConfig

| Prop            | Type                 |
| --------------- | -------------------- |
| **`database`**  | <code>string</code>  |
| **`encrypted`** | <code>boolean</code> |
| **`mode`**      | <code>string</code>  |
| **`version`**   | <code>number</code>  |
| **`readonly`**  | <code>boolean</code> |
| **`log`**       | <code>boolean</code> |


#### IReturnExecuteQuery

| Prop                | Type                 |
| ------------------- | -------------------- |
| **`changes`**       | <code>number</code>  |
| **`hasChanged`**    | <code>boolean</code> |
| **`values`**        | <code>T[]</code>     |
| **`changedValues`** | <code>T[]</code>     |


#### IMigrationDatabaseOrmSQLite

| Prop          | Type                  |
| ------------- | --------------------- |
| **`version`** | <code>number</code>   |
| **`sql`**     | <code>string[]</code> |


### Type Aliases


#### Partial

Make all properties in T optional

<code>{ [P in keyof T]?: T[P]; }</code>

</docgen-api>
