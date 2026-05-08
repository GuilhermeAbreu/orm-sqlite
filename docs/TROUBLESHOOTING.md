# Troubleshooting

## Error Codes (`OrmSQLiteError`)

### `ERR_SQLITE_NOT_CONFIGURED`
- Cause: `DatabaseConnectionOrmSQLite` was used before initialization.
- Fix: initialize once during app startup with a valid `SQLiteConnection`.

### `ERR_DATABASE_NAME_NOT_CONFIGURED`
- Cause: database name is empty.
- Fix: set `database` in constructor/config with a non-empty string.

### `ERR_INVALID_CONFIG`
- Cause: invalid `mode` or `version`.
- Fix:
  - use one of: `no-encryption`, `encryption`, `secret`, `decryption`
  - use a positive integer for `version`

### `ERR_EMPTY_SQL`
- Cause: empty SQL passed to `query` or `execute`.
- Fix: validate generated SQL before calling database methods.

### `ERR_INVALID_MIGRATIONS`
- Cause: migrations list is empty, duplicated, or unsorted.
- Fix:
  - provide at least one migration
  - unique versions
  - ascending order by `version`

### `ERR_MIGRATION_NOT_FOUND`
- Cause: missing migration version in sequence.
- Fix: ensure all intermediate versions exist (e.g., 1, 2, 3).

### `ERR_UNSAFE_IDENTIFIER`
- Cause: invalid table/column/index identifier.
- Fix: use only `[A-Za-z_][A-Za-z0-9_]*` for identifiers.

### `ERR_INVALID_COLUMN`
- Cause: field used in query is not decorated with `@Column`.
- Fix: add `@Column` to model field or remove field from query.

### `ERR_TABLE_NAME_NOT_INFORMED`
- Cause: model class has no `@EntityName`.
- Fix: add `@EntityName('table_name')`.

### `ERR_PRIMARY_KEY_NOT_FOUND`
- Cause: operation requiring PK on model without `primaryKey`.
- Fix: define one `@Column({ primaryKey: true })`.

## Startup checklist

1. Initialize `DatabaseConnectionOrmSQLite` once.
2. Run `runMigrationsIfNeeded()` before normal queries.
3. Handle `OrmSQLiteError` by `error.code`.
4. Enable logging (`log: true`) in development only.
