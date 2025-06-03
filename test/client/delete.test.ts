import { QueryBuildSQlite } from '../../src/query/query-build-sqlite';
import { User } from '../class/User.class';


describe('NewQueryBuilder - DELETE Operations', () => {
  let queryBuilder: QueryBuildSQlite<User>;

  beforeEach(() => {
    queryBuilder = new QueryBuildSQlite(User);
  });

  describe('delete', () => {
    it('should generate basic DELETE query', () => {
      const sql = queryBuilder.delete();
      expect(sql).toBe('DELETE FROM user');
    });

    it('should generate DELETE query with WHERE conditions', () => {
      const sql = queryBuilder.delete({
        where: {
          id: 1
        }
      });
      expect(sql).toBe('DELETE FROM user WHERE user.id = 1');
    });

    it('should handle complex WHERE conditions', () => {
      const sql = queryBuilder.delete({
        where: {
          name: { in: ['john@example.com', 'jane@example.com'] }
        }
      });
      expect(sql).toBe(
        "DELETE FROM user WHERE user.name IN ('john@example.com', 'jane@example.com')"
      );
    });

    it('should handle multiple WHERE conditions', () => {
      const sql = queryBuilder.delete({
        where: {
          name: 'John',
          email: {
            not: null
          }
        }
      });
      expect(sql).toBe(
        "DELETE FROM user WHERE user.name = 'John' AND user.email != NULL"
      );
    });

    it('should handle date conditions', () => {
      const date = new Date('2024-01-01');
      const sql = queryBuilder.delete({
        where: {
          createdAt: { gt: date }
        }
      });
      expect(sql).toBe(
        `DELETE FROM user WHERE user.createdAt > '${date.toISOString()}'`
      );
    });

    it('should handle null conditions', () => {
      const sql = queryBuilder.delete({
        where: {
          email: null,
          name: { not: '' }
        },
      });
      expect(sql).toBe(
        "DELETE FROM user WHERE user.email = NULL AND user.name != ''"
      );
    });
  });
}); 