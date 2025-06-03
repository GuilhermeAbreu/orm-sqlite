import { QueryBuildSQlite } from '../../src/query/query-build-sqlite';
import { Post } from '../class/Post.class';

describe('NewQueryBuilder - LEFT JOIN', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }

  it('should generate LEFT JOIN query', () => {
    const queryBuilder = new QueryBuildSQlite<User>(User);
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
    const queryBuilder = new QueryBuildSQlite<User>(User);
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