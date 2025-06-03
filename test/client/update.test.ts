import { NewQueryBuilder } from '../../src/query/new-query-builder';
import { User } from '../class/User.class';

describe('NewQueryBuilder - UPDATE Operations', () => {
  let queryBuilder: NewQueryBuilder<User>;

  beforeEach(() => {
    queryBuilder = new NewQueryBuilder(User);
  });

  describe('update', () => {
    it('should generate basic UPDATE query', () => {
      const data = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        "UPDATE user SET user.name = 'John', user.email = 'john@example.com', user.age = 25"
      );
    });

    it('should generate UPDATE query with WHERE conditions', () => {
      const data = {
        name: 'John',
        email: 'john@example.com'
      };

      queryBuilder.findMany({
        where: {
          id: 1
        }
      });

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        "UPDATE user SET user.name = 'John', user.email = 'john@example.com' WHERE user.id = 1"
      );
    });

    it('should handle null values', () => {
      const data = {
        name: 'John',
        email: null,
        age: null
      };

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        "UPDATE user SET user.name = 'John', user.email = NULL, user.age = NULL"
      );
    });

    it('should handle date values', () => {
      const date = new Date('2024-01-01');
      const data = {
        name: 'John',
        createdAt: date
      };

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        `UPDATE user SET user.name = 'John', user.createdAt = '${date.toISOString()}'`
      );
    });

    it('should handle object values', () => {
      const data = {
        name: 'John',
        metadata: { role: 'admin', active: true }
      };

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        "UPDATE user SET user.name = 'John', user.metadata = '{\"role\":\"admin\",\"active\":true}'"
      );
    });

    it('should handle special characters in strings', () => {
      const data = {
        name: "John O'Connor",
        email: "john.o'connor@example.com"
      };

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        "UPDATE user SET user.name = 'John O''Connor', user.email = 'john.o''connor@example.com'"
      );
    });

    it('should handle complex WHERE conditions', () => {
      const data = {
        name: 'John'
      };

      queryBuilder.findMany({
        where: {
          age: { gt: 18 },
          email: { in: ['john@example.com', 'jane@example.com'] }
        }
      });

      const sql = queryBuilder.update(data).toString();
      expect(sql).toBe(
        "UPDATE user SET user.name = 'John' WHERE user.age > 18 AND user.email IN ('john@example.com', 'jane@example.com')"
      );
    });
  });
}); 