import { NewQueryBuilder } from '../../src/query/new-query-builder';
import { User } from '../class/User.class';

describe('NewQueryBuilder - SELECT Operations', () => {
  let queryBuilder: NewQueryBuilder<User>;

  beforeEach(() => {
    queryBuilder = new NewQueryBuilder(User);
  });

  describe('findMany', () => {
    it('should generate basic SELECT query', () => {
      const sql = queryBuilder.findMany().toString();
      expect(sql).toBe('SELECT * FROM user');
    });

    it('should generate query with WHERE conditions', () => {
      const sql = queryBuilder.findMany({
        where: {
          name: 'John',
          age: 25
        }
      }).toString();

      expect(sql).toBe("SELECT * FROM user WHERE user.name = 'John' AND user.age = 25");
    });

    it('should generate query with complex WHERE conditions', () => {
      const sql = queryBuilder.findMany({
        where: {
          age: { gt: 18 },
          name: { not: 'John' },
          email: { in: ['john@example.com', 'jane@example.com'] }
        }
      }).toString();

      expect(sql).toBe(
        "SELECT * FROM user WHERE user.age > 18 AND user.name != 'John' AND user.email IN ('john@example.com', 'jane@example.com')"
      );
    });

    it('should generate query with ORDER BY', () => {
      const sql = queryBuilder.findMany({
        orderBy: {
          name: 'asc',
          age: 'desc'
        }
      }).toString();

      expect(sql).toBe('SELECT * FROM user ORDER BY user.name ASC, user.age DESC');
    });

    it('should generate query with LIMIT and OFFSET', () => {
      const sql = queryBuilder.findMany({
        take: 10,
        skip: 20
      }).toString();

      expect(sql).toBe('SELECT * FROM user LIMIT 10 OFFSET 20');
    });

    it('should generate query with all options', () => {
      const sql = queryBuilder.findMany({
        where: {
          age: { gt: 18 },
          name: 'John'
        },
        take: 10,
        skip: 0,
        orderBy: {
          name: 'asc'
        },
        
      }).toString();

      expect(sql).toBe(
        "SELECT * FROM user WHERE user.age > 18 AND user.name = 'John' ORDER BY user.name ASC LIMIT 10 OFFSET 0"
      );
    });

    it('should handle null values in WHERE conditions', () => {
      const sql = queryBuilder.findMany({
        where: {
          name: null,
          email: undefined
        }
      }).toString();

      expect(sql).toBe('SELECT * FROM user WHERE user.name = NULL AND user.email = NULL');
    });

    it('should handle date values in WHERE conditions', () => {
      const date = new Date('2024-01-01');
      const sql = queryBuilder.findMany({
        where: {
          createdAt: {
            eq: date
          }
        }
      });

      expect(sql).toBe(`SELECT * FROM user WHERE user.createdAt = '${date.toISOString()}'`);
    });
  });

  describe('findFirst', () => {
    it('should generate query with LIMIT 1', () => {
      const sql = queryBuilder.findFirst().toString();
      expect(sql).toBe('SELECT * FROM user LIMIT 1');
    });

    it('should generate query with WHERE conditions and LIMIT 1', () => {
      const sql = queryBuilder.findFirst({
        where: {
          name: 'John'
        }
      }).toString();

      expect(sql).toBe("SELECT * FROM user WHERE user.name = 'John' LIMIT 1");
    });

    it('should generate query with all options and LIMIT 1', () => {
      const sql = queryBuilder.findFirst({
        where: {
          age: { gt: 18 }
        },
        orderBy: {
          name: 'desc'
        }
      }).toString();

      expect(sql).toBe('SELECT * FROM user WHERE user.age > 18 ORDER BY user.name DESC LIMIT 1');
    });
  });
}); 