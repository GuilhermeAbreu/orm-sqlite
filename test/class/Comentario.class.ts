import { Column, EntityName, OneToMany } from '../../src/decoratiors/decoratiors.orm';

@EntityName('Comentarios')
export class Comentario {

    @Column({
        primaryKey: true
    })
    public id!: number;

    @Column()
    descricao: string = '';

    @OneToMany()
    postId!: number;

    constructor(pUser: Partial<Comentario>) {
        this.id = pUser.id ?? this.id;
        this.descricao = pUser.descricao ?? this.descricao;
        this.postId = pUser.postId ?? this.postId;
    }
}