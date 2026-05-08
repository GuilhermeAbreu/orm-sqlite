import {
  DatabaseConnectionOrmSQlite,
  DatabaseConnectionOrmSQLite,
  QueryBuildOrmSQlite,
  QueryBuildOrmSQLite,
  QueryBuildSQlite,
  QueryBuildSQLite,
} from '../src/index';

describe('Public API aliases', () => {
  it('should keep backward compatibility with old and new class names', () => {
    expect(DatabaseConnectionOrmSQLite).toBe(DatabaseConnectionOrmSQlite);
    expect(QueryBuildOrmSQLite).toBe(QueryBuildOrmSQlite);
    expect(QueryBuildSQLite).toBe(QueryBuildSQlite);
  });
});
