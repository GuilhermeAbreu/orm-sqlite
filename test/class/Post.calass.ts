import { Column, EntityName, OneToMany } from '../../src/decoratiors/decoratiors.orm';
import { Comentario } from './Comentario.class';

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

    @OneToMany()
    public comentarios: Comentario[] = [];

    constructor(ppost: Partial<Post>) {
        this.id = ppost.id ?? this.id;
        this.userId = ppost.userId ?? this.userId;
        this.title = ppost.title ?? this.title;
        this.comentarios = ppost.comentarios ?? this.comentarios;
    }
}