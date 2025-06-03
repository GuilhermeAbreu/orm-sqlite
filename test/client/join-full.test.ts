import { QueryBuilderSQlite } from '../../src/query/query-build-sqlite';

describe('NewQueryBuilder - FULL JOIN', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }
  class Post { static entityName = 'post'; userId!: number; title!: string; }

  const queryBuilder = new QueryBuilderSQlite<User>(User);

  it('should generate FULL JOIN query', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'FULL',
          on: { userId: 1 }
        }
      ]
    }).toString();
    expect(sql).toBe(
      'SELECT * FROM user FULL JOIN post ON post.userId = 1'
    );
  });

  it('should generate FULL JOIN with multiple ON conditions', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,  
          type: 'FULL',
          on: { userId: 1, title: 'João' }
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM user FULL JOIN post ON post.userId = 1 AND post.title = 'João'"
    );
  });
}); 