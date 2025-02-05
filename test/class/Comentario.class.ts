import { Column, EntityName } from '../../src/decoratiors/decoratiors.orm';

@EntityName('Comentarios')
export class Comentario {

    @Column({
        primaryKey: true
    })
    public id!: number;

    @Column()
    descricao: string = '';

    @Column()
    postId!: number;

    constructor(pUser: Partial<Comentario>) {
        this.id = pUser.id ?? this.id;
        this.descricao = pUser.descricao ?? this.descricao;
        this.postId = pUser.postId ?? this.postId;
    }
}