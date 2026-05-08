import { OrmSQLiteError } from '../../src/errors/orm-sqlite.error';
import { QueryBuildSQlite } from '../../src/query/query-build-sqlite';
import { User } from '../class/User.class';

describe('NewQueryBuilder - INSERT Operations', () => {
  let queryBuilder: QueryBuildSQlite<User>;

  beforeEach(() => {
    queryBuilder = new QueryBuildSQlite(User);
  });

  describe('insert', () => {
    it('should generate basic INSERT query', () => {
      const data = {
        name: 'John',
        email: 'john@example.com',
        age: 25
      };

      const sql = queryBuilder.insert(data).toString();
      expect(sql).toBe(
        "INSERT INTO user (name, email, age) VALUES ('John', 'john@example.com', 25)"
      );
    });

    it('should handle null values', () => {
      const data = {
        name: 'John',
        email: null,
        age: null
      };

      const sql = queryBuilder.insert(data).toString();
      expect(sql).toBe(
        "INSERT INTO user (name, email, age) VALUES ('John', NULL, NULL)"
      );
    });

    it('should handle date values', () => {
      const date = new Date('2024-01-01');
      const data = {
        name: 'John',
        createdAt: date
      };

      const sql = queryBuilder.insert(data).toString();
      expect(sql).toBe(
        `INSERT INTO user (name, createdAt) VALUES ('John', '${date.toISOString()}')`
      );
    });

    it('should handle object values', () => {
      const data = {
        name: 'John',
        metadata: { role: 'admin', active: true }
      };

      const sql = queryBuilder.insert(data).toString();
      expect(sql).toBe(
        "INSERT INTO user (name, metadata) VALUES ('John', '{\"role\":\"admin\",\"active\":true}')"
      );
    });

    it('should handle multiple rows', () => {
      const data = [
        {
          name: 'John',
          email: 'john@example.com',
          age: 25
        },
        {
          name: 'Jane',
          email: 'jane@example.com',
          age: 30
        }
      ];

      const sql = queryBuilder.insert(data).toString();
      expect(sql).toBe(
        "INSERT INTO user (name, email, age) VALUES ('John', 'john@example.com', 25), ('Jane', 'jane@example.com', 30)"
      );
    });

    it('should handle special characters in strings', () => {
      const data = {
        name: "John O'Connor",
        email: "john.o'connor@example.com"
      };

      const sql = queryBuilder.insert(data).toString();
      expect(sql).toBe(
        "INSERT INTO user (name, email) VALUES ('John O''Connor', 'john.o''connor@example.com')"
      );
    });

    it('should expose ERR_UNSAFE_IDENTIFIER for unsafe insert column', () => {
      try {
        queryBuilder.insert({
          ['name;DROP TABLE user;--' as any]: 'John',
        } as any);
        throw new Error('expected insert to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(OrmSQLiteError);
        expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
      }
    });

    it('should generate parameterized INSERT query', () => {
      const result = queryBuilder.insertWithParams({
        name: 'John',
        email: 'john@example.com',
        age: 25,
      } as any);

      expect(result.sql).toBe('INSERT INTO user (name, email, age) VALUES (?, ?, ?)');
      expect(result.params).toEqual(['John', 'john@example.com', 25]);
    });
  });
}); 
