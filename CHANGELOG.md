# Changelog

## [5.1.0] - 2026-09-16

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
- `insert()`/`update()` in `QueryBuildOrmSQlite` and `QueryBuildSQlite` now throw `ERR_PAYLOAD_TOO_LARGE_FOR_INLINE_SQL`
  when an object/array column value would be inlined as a JSON literal larger than 200,000 bytes, instead of silently
  embedding it in the SQL text. On SQLite-in-WASM (web/sql.js) targets, a large enough inline literal can overflow the
  WASM heap during query execution, surfacing as opaque `memory access out of bounds` / `table index is out of bounds`
  errors. Use `insertWithParams()`/`updateWithParams()` for large payloads — they bind the value as a parameter instead
  of inlining it.

### Tests
- Expanded coverage for connection lifecycle, migration failure paths, unsafe identifiers and alias compatibility.
