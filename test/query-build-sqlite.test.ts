import { OrmSQLiteError } from '../src/errors/orm-sqlite.error';
import { QueryBuildSQlite } from '../src/query/query-build-sqlite';

import { User } from './class/User.class';

describe('QueryBuildSQlite', () => {
  let queryBuilder: QueryBuildSQlite<User>;

  beforeEach(() => {
    queryBuilder = new QueryBuildSQlite(User);
  });

  it('should throw when inlining an oversized object value in insert()', () => {
    const bigArray = Array.from({ length: 50000 }, (_, i) => i);

    expect(() => queryBuilder.insert({ name: 'John', data: bigArray } as any)).toThrow(OrmSQLiteError);

    try {
      queryBuilder.insert({ name: 'John', data: bigArray } as any);
      throw new Error('expected insert to throw');
    } catch (error) {
      expect((error as OrmSQLiteError).code).toBe('ERR_PAYLOAD_TOO_LARGE_FOR_INLINE_SQL');
    }
  });

  it('should throw when inlining an oversized object value in update()', () => {
    const bigArray = Array.from({ length: 50000 }, (_, i) => i);

    expect(() => queryBuilder.update({ data: bigArray } as any)).toThrow(OrmSQLiteError);
  });

  it('should not throw for object values within the safe inline size', () => {
    expect(() => queryBuilder.insert({ name: 'John', data: { text: 'olá' } } as any)).not.toThrow();
  });

  it('should not throw for an oversized object value in insertWithParams (bound, not inlined)', () => {
    const bigArray = Array.from({ length: 50000 }, (_, i) => i);

    expect(() => queryBuilder.insertWithParams({ name: 'John', data: bigArray } as any)).not.toThrow();
  });
});
