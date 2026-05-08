export type OrmSQLiteErrorCode =
  | 'ERR_SQLITE_NOT_CONFIGURED'
  | 'ERR_DATABASE_NAME_NOT_CONFIGURED'
  | 'ERR_EMPTY_SQL'
  | 'ERR_INVALID_MIGRATIONS'
  | 'ERR_UNSAFE_IDENTIFIER'
  | 'ERR_INVALID_COLUMN'
  | 'ERR_MIGRATION_NOT_FOUND'
  | 'ERR_TABLE_NAME_NOT_INFORMED'
  | 'ERR_PRIMARY_KEY_NOT_FOUND'
  | 'ERR_INVALID_CONFIG';

export class OrmSQLiteError extends Error {
  public readonly code: OrmSQLiteErrorCode;

  constructor(code: OrmSQLiteErrorCode, message: string) {
    super(message);
    this.name = 'OrmSQLiteError';
    this.code = code;
  }
}
