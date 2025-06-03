import { NewQueryBuilder } from '../../src/query/new-query-builder';

describe('NewQueryBuilder - LEFT JOIN', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }
  class Post { static entityName = 'post'; userId!: number; title!: string; }

  const queryBuilder = new NewQueryBuilder<User>(User);

  it('should generate LEFT JOIN query', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'LEFT',
          on: { userId: 1 }
        }
      ]
    }).toString();
    expect(sql).toBe(
      'SELECT * FROM user LEFT JOIN post ON post.userId = 1'
    );
  });

  it('should generate LEFT JOIN with multiple ON conditions', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'LEFT',
          on: { userId: 1, title: 'João' }
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM user LEFT JOIN post ON post.userId = 1 AND post.title = 'João'"
    );
  });
}); 