# Changelog

## Unreleased

### Added
- Standardized `OrmSQLiteError` with stable `code` values.
- Path/class aliases for corrected naming while preserving backward compatibility.
- New API aliases:
  - `DatabaseConnectionOrmSQLite`
  - `QueryBuildOrmSQLite`
  - `QueryBuildSQLite`
- New troubleshooting guide at `docs/TROUBLESHOOTING.md`.
- GitHub Actions CI workflow with lint, test and build.
- New script `npm run ci`.
- Parameterized query builder methods:
  - `getQueryWithParams()`
  - `insertWithParams()`
  - `updateWithParams()`
- Database execution methods with parameters:
  - `executeWithParams()`
  - `queryWithParams()`

### Changed
- Migration execution now runs SQL list within transaction and rolls back on failure.
- Connection config validation now enforces valid `mode` and `version`.
- JSON parsing in query results now only parses object/array strings.

### Security
- SQL identifier validation added across builders and DDL (`ERR_UNSAFE_IDENTIFIER`).
- Column metadata validation emits stable error code (`ERR_INVALID_COLUMN`).

### Tests
- Expanded coverage for connection lifecycle, migration failure paths, unsafe identifiers and alias compatibility.
