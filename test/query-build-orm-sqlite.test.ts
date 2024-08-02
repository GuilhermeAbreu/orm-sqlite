
import { QueryBuildOrmSQlite } from './../src/query/query-build';
import { Post } from './class/Post.calass';
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
        expect(query).toBe("SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( json_object( 'id', posts.id , 'userId', posts.userId , 'title', posts.title ) ) ELSE NULL END AS posts FROM user INNER JOIN post posts ON user.id = posts.userId");
    });

    it('should generate a select query with left join', () => {
        const query = queryBuilder.leftJoin(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
        expect(query).toBe("SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( json_object( 'id', posts.id , 'userId', posts.userId , 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId");
    });

    it('should generate a select query with right join', () => {
        const query = queryBuilder.rightJoin(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
        expect(query).toBe("SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( json_object( 'id', posts.id , 'userId', posts.userId , 'title', posts.title ) ) ELSE NULL END AS posts FROM user RIGHT JOIN post posts ON user.id = posts.userId");
    });

    it('should generate a select query with full join', () => {
        const query = queryBuilder.fullJoin(Post, 'id', 'userId', 'posts').getQuery().replace(/\s+/g, ' ');
        expect(query).toBe("SELECT user.*, CASE WHEN posts.id IS NOT NULL THEN json_group_array( json_object( 'id', posts.id , 'userId', posts.userId , 'title', posts.title ) ) ELSE NULL END AS posts FROM user FULL JOIN post posts ON user.id = posts.userId");
    });

    it('should generate a select query with group by', () => {
        const query = queryBuilder.groupBy('id').getQuery().replace(/\s+/g, ' ');
        expect(query).toBe('SELECT user.* FROM user GROUP BY user.id');
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
        expect(query).toBe('SELECT user.* FROM user ORDER BY id DESC');
    });


    it('should generate a correct INSERT query', function () {
        const queryBuilder = new QueryBuildOrmSQlite<User>(User);
        const insertValues = [new User({ name: 'John Doe' }), new User({ name: 'Jane Smith' })];
        const expectedQuery = "INSERT INTO user (id, name) VALUES (NULL, 'John Doe'), (NULL, 'Jane Smith')";
    ;

        const query = queryBuilder.insert(insertValues).replace(/\s{2,}/g, ' '); // Remove espaços extras
        expect(query).toBe(expectedQuery);
    });

    it('should generate a correct UPDATE query', function () {
        const queryBuilder = new QueryBuildOrmSQlite<User>(User);
        const updateValues = new User({name: 'John Doe Updated'});
        const expectedQuery = "UPDATE user SET name = 'John Doe Updated' WHERE id = 1";

        const query = queryBuilder.where('id', 1).update(updateValues).replace(/\s{2,}/g, ' '); // Remove espaços extras
        expect(query).toBe(expectedQuery);
    });

    it('should generate a correct DELETE query', function () {
        const queryBuilder = new QueryBuildOrmSQlite<User>(User);
        const expectedQuery = "DELETE FROM user WHERE id = 1";

        const query = queryBuilder.where('id', 1).delete().replace(/\s{2,}/g, ' '); // Remove espaços extras
        expect(query).toBe(expectedQuery);
    });

    it('should generate a correct SELECT query with LEFT JOIN', function () {
        const queryBuilder = new QueryBuildOrmSQlite<User>(User);

        queryBuilder
            .leftJoin(Post, 'id', 'userId', 'posts')
            .where('name', 'John Doe')
            .distinct('name')
            .orderBy('name')
            .limit(10)
            .offset(5);

        const expectedQuery = "SELECT DISTINCT user.name, CASE WHEN posts.id IS NOT NULL THEN json_group_array( json_object( 'id', posts.id , 'userId', posts.userId , 'title', posts.title ) ) ELSE NULL END AS posts FROM user LEFT JOIN post posts ON user.id = posts.userId WHERE user.name = 'John Doe' ORDER BY name ASC LIMIT 10 OFFSET 5";

        const query = queryBuilder.getQuery().replace(/\s{2,}/g, ' '); // Remove espaços extras
        expect(query).toBe(expectedQuery);
    });

});
