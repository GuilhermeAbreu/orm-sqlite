import { afterAll, afterEach, beforeAll, expect, test } from '@jest/globals';
import sqlite3 from 'sqlite3';


import { QueryBuildOrmSQlite } from './../src/query/query-build';
import { Post } from './class/Post.calass';
import { User } from './class/User.class';



// Configura o banco de dados SQLite em memória para testes
const db = new sqlite3.Database(':memory:');

beforeAll((done) => {
    // Cria as tabelas no banco de dados de teste
    db.serialize(() => {
        db.run(
            new QueryBuildOrmSQlite(User)
                .createTable(
                    [
                        {
                            name: 'id',
                            type: 'INTEGER',
                            primaryKey: true,
                            notNull: true,
                            autoIncremente: true,
                        },
                        {
                            name: 'name',
                            type: 'TEXT',
                            notNull: true
                        }
                    ]
                ), (err) => {
                    if (err) {
                        return done(err);
                    }

                    db.run(
                        new QueryBuildOrmSQlite(Post)
                            .createTable(
                                [
                                    {
                                        name: 'id',
                                        type: 'INTEGER',
                                        primaryKey: true,
                                        notNull: true,
                                        autoIncremente: true,
                                    },
                                    {
                                        name: 'title',
                                        type: 'TEXT',
                                        notNull: true,
                                    },
                                    {
                                        name: 'userId',
                                        notNull: true,
                                        type: 'INTEGER',
                                    }
                                ]
                            ), done
                    );
                }
        );
    });
});

afterEach((done) => {
    // Limpa os dados após cada teste
    db.run(new QueryBuildOrmSQlite(User).delete(), () => {
        db.run(new QueryBuildOrmSQlite(Post).delete(), done);
    });
});

test('should insert data into the database', (done) => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertValues = [new User({ name: 'John Doe' }), new User({ name: 'Jane Smith' })];
    const query = queryBuilder.insert(insertValues);

    db.run(query, (err) => {
        if (err) {
            return done(err);
        }

        db.all(new QueryBuildOrmSQlite(User).getQuery(), (err, rows: any) => {
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

test('should update data in the database', (done) => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertQuery = queryBuilder.insert([new User({ name: 'John Doe' })]);
    
    db.run(insertQuery, function (err) {
        if (err) {
            return done(err);
        }

        const updateQuery =  new QueryBuildOrmSQlite(User).where('id', this.lastID).update(new User({ name: 'John Doe Updated' }));
        db.run(updateQuery, (err) => {
            if (err) {
                return done(err);
            }

            db.get(new QueryBuildOrmSQlite(User).where('id', this.lastID).getQuery(), (err, row: any) => {
                if (err) {
                    return done(err);
                }

                expect(row.name).toBe('John Doe Updated');
                done();
            });
        });
    });
});

test('should delete data from the database', (done) => {
    const queryBuilder = new QueryBuildOrmSQlite<User>(User);
    const insertQuery = queryBuilder.insert([new User({ name: 'John Doe' })]);

    db.run(insertQuery, function (err) {
        if (err) {
            return done(err);
        }

        const deleteQuery =  new QueryBuildOrmSQlite(User).where('id', this.lastID).delete();
        db.run(deleteQuery, (err) => {
            if (err) {
                return done(err);
            }

            db.all(new QueryBuildOrmSQlite(User).getQuery(), (err, rows) => {
                if (err) {
                    return done(err);
                }

                expect(rows).toHaveLength(0);
                done();
            });
        });
    });
});

test('should select data with LEFT JOIN from the database', (done) => {
    const insertUserQuery = new QueryBuildOrmSQlite<User>(User).insert([new User({ name: 'John Doe' })]);
    
    db.serialize(() => {
        db.run(insertUserQuery, function (err) {
            if (err) {
                return done(err);
            }
            const insertPostQuery = new QueryBuildOrmSQlite<Post>(Post).insert([new Post({ title: 'Post Title', userId: this.lastID })]);

            db.run(insertPostQuery, (err) => {
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

                db.all(selectQuery, (err, rows: any) => {
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
