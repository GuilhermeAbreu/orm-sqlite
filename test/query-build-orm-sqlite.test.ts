import { Column, EntityName } from '../src/decoratiors/decoratiors.orm';
import { OrmSQLiteError } from '../src/errors/orm-sqlite.error';

import { QueryBuildOrmSQlite } from './../src/query/query-build';
import { Comentario } from './class/Comentario.class';
import { LocalStorage } from './class/LocalStorage.class';
import { Post } from './class/Post.class';
import { User } from './class/User.class';

describe('QueryBuildOrmSQlite', () => {
  let queryBuilder: QueryBuildOrmSQlite<User>;

  beforeEach(() => {
    queryBuilder = new QueryBuildOrmSQlite(User);
  });

  it('should generate a simple select query', () => {
    const query = queryBuilder.getQuery().replace(/\s+/g, ' ');
    expect(query).toBe('SELECT user.* FROM user');
  });

  it('should generate a select query with where clause', () => {
    const query = queryBuilder.where('id', 1).getQuery().replace(/\s+/g, ' ');
    expect(query).toBe('SELECT user.* FROM user WHERE user.id = 1');
  });

  it('should generate a select query with inner join', () => {
    const query = queryBuilder.join(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
    expect(query).toBe(
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user INNER JOIN post posts ON user.id = posts.userId"
    );
  });

  it('should generate a select query with left join', () => {
    const query = queryBuilder.leftJoin(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
    expect(query).toBe(
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId"
    );
  });

  it('should generate a select query with right join', () => {
    const query = queryBuilder.rightJoin(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
    expect(query).toBe(
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user RIGHT JOIN post posts ON user.id = posts.userId"
    );
  });

  it('should generate a select query with full join', () => {
    const query = queryBuilder.fullJoin(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
    expect(query).toBe(
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user FULL JOIN post posts ON user.id = posts.userId"
    );
  });

  it('should generate a select query with group by', () => {
    const query = queryBuilder.groupBy('id').getQuery().replace(/\s+/g, ' ');
    expect(query).toBe('SELECT user.* FROM user GROUP BY user.id');
  });

  it('should generate a select query with group by association', () => {
    const query = queryBuilder
      .join(Post, 'id', 'userId', 'posts')
      .groupBy<Post>('posts', 'id')
      .groupBy('id')
      .getQuery()
      .replace(/\s+/g, ' ');
    expect(query).toBe(
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user INNER JOIN post posts ON user.id = posts.userId GROUP BY posts.id, user.id"
    );
  });

  it('should generate a select query with limit', () => {
    const query = queryBuilder.limit(10).getQuery().replace(/\s+/g, ' ');
    expect(query).toBe('SELECT user.* FROM user LIMIT 10');
  });

  it('should generate a select query with offset', () => {
    const query = queryBuilder.limit(10).offset(5).getQuery().replace(/\s+/g, ' ');
    expect(query).toBe('SELECT user.* FROM user LIMIT 10 OFFSET 5');
  });

  it('should generate a select query with order by', () => {
    const query = queryBuilder.orderBy('id', 'DESC').getQuery().replace(/\s+/g, ' ');
    expect(query).toBe('SELECT user.* FROM user ORDER BY user.id DESC');
  });

  it('should generate a select query with order by association', () => {
    const query = queryBuilder
      .leftJoin(Post, 'id', 'userId', 'posts')
      .orderBy('id', 'DESC')
      .orderBy<Post>('posts', 'ASC', 'id')
      .getQuery()
      .replace(/\s+/g, ' ');
    expect(query).toBe(
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId ORDER BY user.id DESC, posts.id ASC"
    );
  });

  it('should generate a correct INSERT query', function () {
    const queryBuilder = new QueryBuildOrmSQlite(User);
    const insertValues = [{ name: 'John Doe' }, { name: 'Jane Smith' }];
    const expectedQuery = "INSERT INTO user (name) VALUES ('John Doe'), ('Jane Smith') RETURNING *";

    const query = queryBuilder.insert(insertValues).replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should generate a correct UPDATE query', function () {
    const queryBuilder = new QueryBuildOrmSQlite(User);
    const updateValues = { name: 'John Doe Updated' };
    const expectedQuery = "UPDATE user SET name = 'John Doe Updated' WHERE id = 1 RETURNING *";

    const query = queryBuilder
      .where('id', 1)
      .update(updateValues)
      .replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should generate a correct DELETE query', function () {
    const queryBuilder = new QueryBuildOrmSQlite(User);
    const expectedQuery = 'DELETE FROM user WHERE id = 1';

    const query = queryBuilder
      .where('id', 1)
      .delete()
      .replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should generate a correct SELECT query with LEFT JOIN', function () {
    const queryBuilder = new QueryBuildOrmSQlite(User);

    queryBuilder.leftJoin(Post, 'id', 'userId', 'posts').where('name', 'John Doe').distinct('name').orderBy('name').limit(10).offset(5);

    const expectedQuery =
      "SELECT DISTINCT user.name, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId WHERE user.name = 'John Doe' ORDER BY user.name ASC LIMIT 10 OFFSET 5";

    const query = queryBuilder.getQuery().replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should generate a correct SELECT query with LEFT JOIN on JOIN', function () {
    const queryBuilder = new QueryBuildOrmSQlite(User);

    queryBuilder
      .leftJoin(Post, 'id', 'userId', 'posts')
      .JoiOnJoin(Post, 'id', Comentario, 'postId', 'comentarios')
      .orderBy('name')
      .limit(10)
      .offset(5);

    const expectedQuery =
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'comentarios', COALESCE( ( SELECT json_group_array( DISTINCT json_object( 'descricao', comentarios.descricao, 'id', comentarios.id, 'postId', comentarios.postId ) ) FROM comentarios WHERE comentarios.postId = posts.id ), NULL ) , 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId ORDER BY user.name ASC LIMIT 10 OFFSET 5";

    const query = queryBuilder.getQuery().replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should generate a correct SELECT query with LEFT JOIN on JOIN', function () {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    queryBuilder
      .leftJoin(Post, 'id', 'userId', 'posts')
      .JoiOnJoin(Post, 'id', Comentario, 'postId', 'comentarios')
      .orderBy('name')
      .limit(10)
      .offset(5);

    const expectedQuery =
      "SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( DISTINCT json_object( 'id', posts.id, 'comentarios', COALESCE( ( SELECT json_group_array( DISTINCT json_object( 'descricao', comentarios.descricao, 'id', comentarios.id, 'postId', comentarios.postId ) ) FROM comentarios WHERE comentarios.postId = posts.id ), NULL ) , 'userId', posts.userId, 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId ORDER BY user.name ASC LIMIT 10 OFFSET 5";

    const query = queryBuilder.getQuery().replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should generate a correct insert into object', function () {
    const queryBuilder = new QueryBuildOrmSQlite<LocalStorage>(LocalStorage);

    const expectedQuery = 'INSERT INTO local_storage (key, value) VALUES (\'teste\', \'{"text":"olá"}\') RETURNING *';

    const query = queryBuilder.insert({ key: 'teste', value: JSON.stringify({ text: 'olá' }) }).replace(/\s{2,}/g, ' '); // Remove espaços extras
    expect(query).toBe(expectedQuery);
  });

  it('should escape single quotes in INSERT values and JSON payload', () => {
    const queryBuilder = new QueryBuildOrmSQlite<LocalStorage>(LocalStorage);
    const payload = {
      text: `He said "ok" and it's fine`,
      owner: "O'Brian"
    };

    const query = queryBuilder.insert({ key: "cfg's", value: JSON.stringify(payload) }).replace(/\s{2,}/g, ' ');

    expect(query).toContain("('cfg''s'");
    expect(query).toContain(`He said \\"ok\\" and it''s fine`);
    expect(query).toContain(`"owner":"O''Brian"`);
  });

  it('should escape single quotes in UPDATE values', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    const query = queryBuilder
      .where('id', 1)
      .update({ name: 'D\'Angelo "Dev"' })
      .replace(/\s{2,}/g, ' ');

    expect(query).toBe(`UPDATE user SET name = 'D''Angelo "Dev"' WHERE id = 1 RETURNING *`);
  });

  it('deve gerar uma consulta SELECT com whereIn', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    const query = queryBuilder.whereIn('id', [1, 2, 3]).getQuery().replace(/\s+/g, ' ');

    expect(query).toBe('SELECT user.* FROM user WHERE user.id IN (1,2,3)');
  });

  it('deve gerar uma consulta SELECT com orIn', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    const query = queryBuilder.where('name', 'João').orIn('id', [1, 2, 3]).getQuery().replace(/\s+/g, ' ');

    expect(query).toBe("SELECT user.* FROM user WHERE user.name = 'João' OR user.id IN (1,2,3)");
  });

  it('deve gerar uma consulta SELECT com or', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    const query = queryBuilder.where('name', 'João').or('id', 1).getQuery().replace(/\s+/g, ' ');

    expect(query).toBe("SELECT user.* FROM user WHERE user.name = 'João' OR user.id = 1");
  });

  it('should block unsafe identifier in whereJoin table alias', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    try {
      (queryBuilder as any).whereJoin('posts; DROP TABLE user;--', 'id', 1);
      throw new Error('expected whereJoin to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should expose stable error code for invalid @Column usage', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    try {
      (queryBuilder as any).where('posts', 1);
      throw new Error('expected where to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_INVALID_COLUMN');
    }
  });

  it('should expose stable error code for unsafe orderBy identifier', () => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);

    try {
      (queryBuilder as any).orderBy('id; DROP TABLE user;--', 'ASC');
      throw new Error('expected orderBy to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should expose stable error code when model has no table name metadata', () => {
    class ModelWithoutEntityName {
      @Column({ primaryKey: true })
      id!: number;
    }

    try {
      new QueryBuildOrmSQlite(ModelWithoutEntityName as any);
      throw new Error('expected constructor to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_TABLE_NAME_NOT_INFORMED');
    }
  });

  it('should expose stable error code when updating model without primary key metadata', () => {
    @EntityName('no_pk_model')
    class ModelWithoutPrimaryKey {
      @Column()
      name!: string;
    }

    try {
      new QueryBuildOrmSQlite(ModelWithoutPrimaryKey as any).update({ name: 'test' });
      throw new Error('expected update to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_PRIMARY_KEY_NOT_FOUND');
    }
  });

  it('should block unsafe identifier in groupBy and expose error code', () => {
    try {
      (queryBuilder as any).groupBy('id;DROP TABLE user;--').getQuery();
      throw new Error('expected groupBy to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should block unsafe identifier in distinct and expose error code', () => {
    try {
      (queryBuilder as any).distinct('name;DROP TABLE user;--');
      throw new Error('expected distinct to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should block unsafe column identifier in addColumn', () => {
    try {
      queryBuilder.addColumn({ name: 'x;DROP TABLE user;--' as any, type: 'TEXT' });
      throw new Error('expected addColumn to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should block unsafe column identifier in dropColumn', () => {
    try {
      (queryBuilder as any).dropColumn('id;DROP TABLE user;--');
      throw new Error('expected dropColumn to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(OrmSQLiteError);
      expect((error as OrmSQLiteError).code).toBe('ERR_UNSAFE_IDENTIFIER');
    }
  });

  it('should generate insert without RETURNING when disabled', () => {
    const sql = queryBuilder
      .insert([{ name: 'John' }], false)
      .replace(/\s{2,}/g, ' ')
      .trim();
    expect(sql).toBe("INSERT INTO user (name) VALUES ('John')");
  });

  it('should generate update without RETURNING when disabled', () => {
    const sql = queryBuilder
      .where('id', 1)
      .update({ name: 'John' }, false)
      .replace(/\s{2,}/g, ' ')
      .trim();
    expect(sql).toBe("UPDATE user SET name = 'John' WHERE id = 1");
  });

  it('should generate parameterized insert query', () => {
    const result = queryBuilder.insertWithParams([{ name: 'John', age: 30 } as any], false);
    expect(result.sql).toBe('INSERT INTO user (name, age) VALUES (?, ?)');
    expect(result.params).toEqual(['John', 30]);
  });

  it('should generate parameterized update query', () => {
    const result = queryBuilder.where('id', 1).updateWithParams({ name: 'John' } as any, false);
    expect(result.sql).toBe('UPDATE user SET name = ? WHERE id = ?');
    expect(result.params).toEqual(['John', 1]);
  });

  it('should generate parameterized select query for where and whereJoin', () => {
    const qbAny: any = queryBuilder;
    const result = qbAny.where('id', 1).whereJoin('user', 'name', 'John').getQueryWithParams();

    expect(result.sql).toContain('user.id = ?');
    expect(result.sql).toContain('user.name = ?');
    expect(result.params).toEqual([1, 'John']);
  });

  it('should generate parameterized query for whereIn and orIn preserving params order', () => {
    const result = queryBuilder
      .where('name', 'John')
      .whereIn('id', [1, 2])
      .orIn('age', [30, 40] as any)
      .getQueryWithParams();

    expect(result.sql).toContain('user.name = ?');
    expect(result.sql).toContain('user.id IN (?,?)');
    expect(result.sql).toContain('user.age IN (?,?)');
    expect(result.params).toEqual(['John', 1, 2, 30, 40]);
  });

  it('should keep semantic parity between getQuery and getQueryWithParams', () => {
    const literalSql = queryBuilder
      .where('name', 'John')
      .whereIn('id', [1, 2, 3])
      .orderBy('id', 'DESC')
      .limit(5)
      .getQuery()
      .replace(/\s+/g, ' ');

    const parameterized = queryBuilder.getQueryWithParams();
    const parameterizedSql = parameterized.sql.replace(/\s+/g, ' ');

    expect(literalSql).toContain("WHERE user.name = 'John'");
    expect(literalSql).toContain('user.id IN (1,2,3)');
    expect(parameterizedSql).toContain('WHERE user.name = ?');
    expect(parameterizedSql).toContain('user.id IN (?,?,?)');
    expect(parameterizedSql).toContain('ORDER BY user.id DESC');
    expect(parameterizedSql).toContain('LIMIT 5');
    expect(parameterized.params).toEqual(['John', 1, 2, 3]);
  });

  it('should preserve date formatting in getQueryWithParams', () => {
    const date = new Date('2025-01-01T10:30:00.000Z');
    const result = queryBuilder.where('createdAt', date as any).getQueryWithParams();

    expect(result.sql).toContain('user.createdAt = ?');
    expect(result.params).toHaveLength(1);
    expect(typeof result.params[0]).toBe('string');
    expect(result.params[0]).toContain('2025-01-01');
  });
});
