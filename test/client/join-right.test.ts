import { QueryBuildSQlite } from '../../src/query/query-build-sqlite';

describe('NewQueryBuilder - RIGHT JOIN', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }
  class Post { static entityName = 'post'; userId!: number; title!: string; }

  const queryBuilder = new QueryBuildSQlite<User>(User);

  it('should generate RIGHT JOIN query', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'RIGHT',
          on: { userId: 1 }
        }
      ]
    }).toString();
    expect(sql).toBe(
      'SELECT * FROM user RIGHT JOIN post ON post.userId = 1'
    );
  });

  it('should generate RIGHT JOIN with multiple ON conditions', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'RIGHT',
          on: { userId: 1, title: 'João' }
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM user RIGHT JOIN post ON post.userId = 1 AND post.title = 'João'"
    );
  });
}); 