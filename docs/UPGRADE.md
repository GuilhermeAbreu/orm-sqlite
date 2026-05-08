# Upgrade Guide

## 3.2.0

### New APIs

- `DatabaseConnectionOrmSQLite.executeWithParams(sql, params)`
- `DatabaseConnectionOrmSQLite.queryWithParams(sql, params)`
- `DatabaseConnectionOrmSQLite.queryOneWithParams(sql, params)`
- `DatabaseConnectionOrmSQLite.executeTransaction(asyncWork)`
- `QueryBuildOrmSQLite.getQueryWithParams()`
- `QueryBuildOrmSQLite.insertWithParams()`
- `QueryBuildOrmSQLite.updateWithParams()`

### Error handling

Use `OrmSQLiteError` and handle by `error.code`:

- `ERR_INVALID_CONFIG`
- `ERR_EMPTY_SQL`
- `ERR_INVALID_MIGRATIONS`
- `ERR_MIGRATION_NOT_FOUND`
- `ERR_UNSAFE_IDENTIFIER`
- `ERR_INVALID_COLUMN`
- `ERR_TABLE_NAME_NOT_INFORMED`
- `ERR_PRIMARY_KEY_NOT_FOUND`

### Naming aliases

Recommended names (legacy names still work):

- `DatabaseConnectionOrmSQLite` (`DatabaseConnectionOrmSQlite` legacy)
- `QueryBuildOrmSQLite` (`QueryBuildOrmSQlite` legacy)
- `QueryBuildSQLite` (`QueryBuildSQlite` legacy)

### Migration notes

No breaking API removal in `3.2.0`.
Existing code keeps working, but new projects should adopt:

1. parameterized methods (`*WithParams`)
2. `executeTransaction` for atomic multi-step operations
3. standardized `OrmSQLiteError.code` handling
