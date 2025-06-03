import { NewQueryBuilder } from '../../src/query/new-query-builder';

describe('NewQueryBuilder - INNER JOIN', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }
  class Post { static entityName = 'post'; userId!: number; title!: string; }

  const queryBuilder = new NewQueryBuilder<User>(User);

  it('should generate INNER JOIN query', () => {
    const sql = queryBuilder.findMany<Post>({
      join: [
        {
          table: Post,
          type: 'INNER',
          on: { userId: 1 }
        }
      ]
    }).toString();
    expect(sql).toBe(
      'SELECT * FROM user INNER JOIN post ON post.userId = 1'
    );
  });

  it('should generate INNER JOIN with multiple ON conditions', () => {
    const sql = queryBuilder.findMany<Post>({
      join: [
        {
          table: Post,
          type: 'INNER',
          on: { userId: 1, title: 'João' }
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM user INNER JOIN post ON post.userId = 1 AND post.title = 'João'"
    );
  });
}); 