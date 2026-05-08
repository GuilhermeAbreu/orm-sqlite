import { Column, EntityName, OneToMany } from '../../src/decoratiors/decoratiors.orm';

import type { Post } from './Post.class';

@EntityName('User')
export class User {
  @Column({
    primaryKey: true
  })
  public id!: number | null;

  @Column()
  public name!: string;

  @Column()
  public email!: string | null;

  @Column()
  public age!: number | null;

  @Column()
  public createdAt!: Date;

  @OneToMany()
  public posts!: Post[] | null;

  constructor(pUser: Partial<User>) {
    this.id = pUser.id ?? this.id;
    this.name = pUser.name ?? this.name;
    this.email = pUser.email ?? this.email;
    this.age = pUser.age ?? this.age;
    this.createdAt = pUser.createdAt ?? this.createdAt;
    this.posts = pUser.posts ?? this.posts;
  }
}
