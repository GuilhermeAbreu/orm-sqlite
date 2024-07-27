import { Column, EntityName } from '../../src/decoratiors/decoratiors.orm';

export interface IPost {
    id: number
};

@EntityName('Post')
export class Post {

    @Column({ primaryKey: true })
    public id: number | null = null;

    @Column()
    public userId!: number;

    @Column()
    public title!: string;

    constructor(ppost: Partial<Post>) {
        this.id = ppost.id ?? this.id;
        this.userId = ppost.userId ?? this.userId;
        this.title = ppost.title ?? this.title;
    }
}