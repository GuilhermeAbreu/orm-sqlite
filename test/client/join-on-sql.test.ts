import { QueryBuilderSQlite } from '../../src/query/query-build-sqlite';

describe('NewQueryBuilder - JOIN com ON customizado (string e array de strings)', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }
  class Post { static entityName = 'post'; id!: number; userId!: number; title!: string; }

  const queryBuilder = new QueryBuilderSQlite<User>(User);

  it('should generate JOIN with ON as a custom SQL string', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'INNER',
          on: 'user.id = post.userId'
        }
      ]
    }).toString();
    expect(sql).toBe(
      'SELECT * FROM user INNER JOIN post ON user.id = post.userId'
    );
  });

  it('should generate JOIN with ON as an array of custom SQL strings', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Post,
          type: 'INNER',
          on: ['user.id = post.userId', 'user.name = post.title']
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM user INNER JOIN post ON user.id = post.userId AND user.name = post.title"
    );
  });
}); 