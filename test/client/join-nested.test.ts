import { NewQueryBuilder } from '../../src/query/new-query-builder';

describe('NewQueryBuilder - Nested JOIN (join em join)', () => {
  class User { static entityName = 'user'; id!: number; name!: string; }
  class Post { static entityName = 'post'; id!: number; userId!: number; title!: string; }
  class Comment { static entityName = 'comment'; id!: number; postId!: number; content!: string; }

  const queryBuilder = new NewQueryBuilder<Post>(Post);

  it('should generate nested JOIN (join em join)', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Comment,
          type: 'LEFT',
          on: { postId: 1 },
          join: [
            {
              table: User,
              type: 'INNER',
              on: { id: 2 }
            }
          ]
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM post LEFT JOIN comment ON comment.postId = 1 INNER JOIN user ON user.id = 2"
    );
  });

  it('should generate multiple joins at the same level', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Comment,
          type: 'LEFT',
          on: { postId: 1,  },
        },
        {
          table: User,
          type: 'INNER',
          on: { id: 2 , name: 'João' }
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM post LEFT JOIN comment ON comment.postId = 1 INNER JOIN user ON user.id = 2 AND user.name = 'João'"
    );
  });

  it('should generate deeply nested joins', () => {
    const sql = queryBuilder.findMany({
      join: [
        {
          table: Comment,
          type: 'LEFT',
          on: { postId: 1 },
          join: [
            {
              table: User,
              type: 'INNER',
              on: { id: 2 , },
              join: [
                {
                  table: Post,
                  type: 'RIGHT',
                  on: { id: 3 }
                }
              ]
            }
          ]
        }
      ]
    }).toString();
    expect(sql).toBe(
      "SELECT * FROM post LEFT JOIN comment ON comment.postId = 1 INNER JOIN user ON user.id = 2 RIGHT JOIN post ON post.id = 3"
    );
  });
}); 