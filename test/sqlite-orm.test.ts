import { afterAll, afterEach, beforeAll, describe, expect, test } from '@jest/globals';

import { QueryBuildOrmSQlite } from './../src/query/query-build';
import { LocalStorage } from './class/LocalStorage.class';
import { Post } from './class/Post.class';
import { User } from './class/User.class';

let sqlite3: any;
try {
  sqlite3 = require('sqlite3');
} catch {
  sqlite3 = null;
}

const describeIfSqlite3 = sqlite3 ? describe : describe.skip;
type SqliteError = Error | null;

if (!sqlite3) {
  test('should skip sqlite integration tests when sqlite3 native binding is unavailable', () => {
    expect(true).toBe(true);
  });
}

describeIfSqlite3('SQLite integration tests', () => {
  if (!sqlite3) {
    return;
  }

  // Configura o banco de dados SQLite em memória para testes
  const db = new sqlite3.Database(':memory:');

  beforeAll(done => {
    // Cria as tabelas no banco de dados de teste
    db.serialize(() => {
      db.run(
        new QueryBuildOrmSQlite(LocalStorage).createTable([
          {
            name: 'id',
            type: 'INTEGER',
            autoIncremente: true,
            primaryKey: true
          },
          {
            name: 'key',
            type: 'TEXT',
            notNull: true,
            unique: true
          },
          {
            name: 'value',
            type: 'TEXT',
            notNull: true
          }
        ])
      ),
        db.run(
          new QueryBuildOrmSQlite(User).createTable([
            {
              name: 'id',
              type: 'INTEGER',
              primaryKey: true,
              notNull: true,
              autoIncremente: true
            },
            {
              name: 'name',
              type: 'TEXT',
              notNull: true
            },
            {
              name: 'email',
              type: 'TEXT'
            },
            {
              name: 'age',
              type: 'INTEGER'
            },
            {
              name: 'createdAt',
              type: 'TEXT'
            }
          ]),
          (err: SqliteError) => {
            if (err) {
              return done(err);
            }

            db.run(
              new QueryBuildOrmSQlite(Post).createTable([
                {
                  name: 'id',
                  type: 'INTEGER',
                  primaryKey: true,
                  notNull: true,
                  autoIncremente: true
                },
                {
                  name: 'title',
                  type: 'TEXT',
                  notNull: true
                },
                {
                  name: 'userId',
                  notNull: true,
                  type: 'INTEGER'
                }
              ]),
              done
            );
          }
        );
    });
  });

  afterEach(done => {
    db.run(new QueryBuildOrmSQlite(User).delete(), () => {
      db.run(new QueryBuildOrmSQlite(Post).delete(), done);
    });
  });

  test('should insert data into the database', done => {
    const queryBuilder = new QueryBuildOrmSQlite<LocalStorage>(LocalStorage);
    const insertValues = [new LocalStorage({ key: 'key-teste-1', value: String({ valor: 'sim' }) })];
    const query = queryBuilder.insert(insertValues);

    db.run(query, (err: SqliteError) => {
      if (err) {
        return done(err);
      }

      db.all(new QueryBuildOrmSQlite(LocalStorage).getQuery(), (err: SqliteError, rows: any) => {
        if (err) {
          return done(err);
        }

        expect(rows).toHaveLength(1);
        expect(rows[0].key).toBe('key-teste-1');
        expect(rows[0].value).toBe(String({ valor: 'sim' }));
        done();
      });
    });
  });

  test('should insert and update values with single and double quotes without SQL errors', done => {
    const queryBuilder = new QueryBuildOrmSQlite<LocalStorage>(LocalStorage);
    const key = `cfg's`;
    const initialValue = JSON.stringify({
      text: `He said "ok" and it's fine`,
      owner: "O'Brian"
    });
    const updatedValue = JSON.stringify({
      text: `Now "updated" and it's still fine`,
      owner: "D'Angelo"
    });

    const insertQuery = queryBuilder.insert([new LocalStorage({ key, value: initialValue })]);

    db.run(insertQuery, function (this: any, err: SqliteError) {
      if (err) {
        return done(err);
      }

      const updateQuery = new QueryBuildOrmSQlite<LocalStorage>(LocalStorage).where('id', this.lastID).update({ value: updatedValue });

      db.run(updateQuery, (updateErr: SqliteError) => {
        if (updateErr) {
          return done(updateErr);
        }

        db.get(
          new QueryBuildOrmSQlite<LocalStorage>(LocalStorage).where('id', this.lastID).getQuery(),
          (selectErr: SqliteError, row: any) => {
            if (selectErr) {
              return done(selectErr);
            }

            expect(row.key).toBe(key);
            expect(row.value).toBe(updatedValue);
            done();
          }
        );
      });
    });
  });

  test('should insert data into the database', done => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertValues = [new User({ name: 'John Doe' }), new User({ name: 'Jane Smith' })];
    const query = queryBuilder.insert(insertValues);

    db.run(query, (err: SqliteError) => {
      if (err) {
        return done(err);
      }

      db.all(new QueryBuildOrmSQlite(User).getQuery(), (err: SqliteError, rows: any) => {
        if (err) {
          return done(err);
        }

        expect(rows).toHaveLength(2);
        expect(rows[0].name).toBe('John Doe');
        expect(rows[1].name).toBe('Jane Smith');
        done();
      });
    });
  });

  test('should query data with whereIn', done => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertValues = [new User({ name: 'John' }), new User({ name: 'Jane' }), new User({ name: 'Bob' })];
    const insertQuery = queryBuilder.insert(insertValues);

    db.run(insertQuery, function (this: any, err: SqliteError) {
      if (err) return done(err);

      const ultimoId = this.lastID;
      const ultimoId2 = this.lastID - 1;

      const ids = [ultimoId, ultimoId2];
      const whereInQuery = new QueryBuildOrmSQlite(User).whereIn('id', ids).getQuery();

      db.all(whereInQuery, (err: SqliteError, rows: any) => {
        if (err) return done(err);

        expect(rows).toHaveLength(2);
        expect(rows[0].name).toBe('Jane');
        expect(rows[1].name).toBe('Bob');
        return done();
      });
    });
  });

  test('should query data with orIn', done => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertValues = [
      new User({ name: 'John Doe' }),
      new User({ name: 'John' }),
      new User({ name: 'Jane' }),
      new User({ name: 'Bob' })
    ];
    const insertQuery = queryBuilder.insert(insertValues);

    db.run(insertQuery, function (this: any, err: SqliteError) {
      if (err) return done(err);

      const ids = [this.lastID, this.lastID - 1, this.lastID - 2];
      const orInQuery = new QueryBuildOrmSQlite(User).orIn('id', ids).getQuery();

      db.all(orInQuery, (err: SqliteError, rows: any) => {
        if (err) return done(err);

        expect(rows).toHaveLength(3);
        expect(rows.map((r: any) => r.name)).toContain('John');
        expect(rows.map((r: any) => r.name)).toContain('Jane');
        expect(rows.map((r: any) => r.name)).toContain('Bob');
        return done();
      });
    });
  });

  test('should query data with or', done => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertValues = [new User({ name: 'John' }), new User({ name: 'Jane' }), new User({ name: 'Bob' })];
    const insertQuery = queryBuilder.insert(insertValues);

    db.run(insertQuery, function (this: any, err: SqliteError) {
      if (err) return done(err);

      const orQuery = new QueryBuildOrmSQlite(User).where('name', 'John').or('name', 'Jane').getQuery();

      db.all(orQuery, (err: SqliteError, rows: any) => {
        if (err) return done(err);

        expect(rows).toHaveLength(2);
        expect(rows[0].name).toBe('John');
        expect(rows[1].name).toBe('Jane');
        return done();
      });
    });
  });

  test('should update data in the database', done => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertQuery = queryBuilder.insert([new User({ name: 'John Doe' })]);

    db.run(insertQuery, function (this: any, err: SqliteError) {
      if (err) {
        return done(err);
      }

      const updateQuery = new QueryBuildOrmSQlite(User).where('id', this.lastID).update(new User({ name: 'John Doe Updated' }));
      db.run(updateQuery, (err: SqliteError) => {
        if (err) {
          return done(err);
        }

        db.get(new QueryBuildOrmSQlite(User).where('id', this.lastID).getQuery(), (err: SqliteError, row: any) => {
          if (err) {
            return done(err);
          }

          expect(row.name).toBe('John Doe Updated');
          done();
        });
      });
    });
  });

  test('should delete data from the database', done => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertQuery = queryBuilder.insert({ name: 'John Doe' });

    db.run(insertQuery, function (this: any, err: SqliteError) {
      if (err) {
        return done(err);
      }

      const deleteQuery = new QueryBuildOrmSQlite(User).where('id', this.lastID).delete();
      db.run(deleteQuery, (err: SqliteError) => {
        if (err) {
          return done(err);
        }

        db.all(new QueryBuildOrmSQlite(User).getQuery(), (err: SqliteError, rows: any[]) => {
          if (err) {
            return done(err);
          }

          expect(rows).toHaveLength(0);
          done();
        });
      });
    });
  });

  test('should select data with LEFT JOIN from the database', done => {
    const insertUserQuery = new QueryBuildOrmSQlite<User>(User).insert([new User({ name: 'John Doe' })]);

    db.serialize(() => {
      db.run(insertUserQuery, function (this: any, err: SqliteError) {
        if (err) {
          return done(err);
        }
        const insertPostQuery = new QueryBuildOrmSQlite<Post>(Post).insert([new Post({ title: 'Post Title', userId: this.lastID })]);

        db.run(insertPostQuery, (err: SqliteError) => {
          if (err) {
            return done(err);
          }

          const selectQuery = new QueryBuildOrmSQlite(User)
            .leftJoin(Post, 'id', 'userId', 'posts')
            .where('name', 'John Doe')
            .limit(10)
            .offset(0)
            .orderBy('id')
            .getQuery();

          db.all(selectQuery, (err: SqliteError, rows: any) => {
            if (err) {
              return done(err);
            }

            expect(rows).toHaveLength(1);
            expect(rows[0].name).toBe('John Doe');
            expect(rows[0].posts).toContain('Post Title');
            done();
          });
        });
      });
    });
  });

  afterAll(() => {
    // Fecha o banco de dados após todos os testes
    db.close();
  });
});
