
import { Column, EntityName, OneToMany } from '../../src/decoratiors/decoratiors.orm';

import type { Post } from './Post.calass';

@EntityName('User')
export class User {

    @Column({
        primaryKey: true
    })
    public id: number | null = null;

    @Column()
    name!: string;

    @OneToMany()
    posts: Post[] | null = null;

    constructor(pUser: Partial<User>) {
        this.id = pUser.id ?? this.id;
        this.name = pUser.name ?? this.name;
        this.posts = pUser.posts ?? this.posts;
    }
}