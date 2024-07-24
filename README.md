markdown

# ORM SQLite para Capacitor

Este projeto é uma biblioteca ORM SQLite para uso com Capacitor, facilitando a integração e manipulação de bancos de dados SQLite em aplicativos móveis.

https://www.npmjs.com/package/@capacitor-community/sqlite

## Instalação

Para instalar o pacote `@guilhermeabreudev/capacitor-orm-sqlite`, execute o seguinte comando:

```bash
npm install @guilhermeabreudev/capacitor-orm-sqlite
npx cap sync && npx cap copy
```
Configuração
1. Adicionar o Plugin ao Projeto
Adicione o plugin ao seu projeto Capacitor. Certifique-se de que o plugin está registrado corretamente.

Configurações de SQLite
https://github.com/capacitor-community/sqlite/blob/master/README.md

Criação da conexão apenas uma única vez no arquivo inicial do seu projeto.

Angular: app-component.ts
```typescript
new DatabaseConnectionOrmSQlite(
    new SQLiteConnection(CapacitorSQLite),
    'Nome do banco',
    'tipo de criptografia',
    'modo de criptografia',
    {{versão: number}},
    {{somenteLeitura: boolean}}
    {{MostrarSQlLog: boolean}}
)
```
o plugin ficará responsável por gerenciar todo a parte de conexão, com isso não se preocupe em abrir ou fechar uma nova conexão.

exemplo básico de usabilidade.

```typescript

import { Column, EntityName, OneToMany } from '@guilhermeabreudev/capacitor-orm-sqlite';

@EntityName('Cliente') // nome da tabela 
export class Cliente implements ICliente { // class modelo

  //coluna do banco de dados
  @Column({
    primaryKey: true
  })
  public id!: number;

  @Column()
  public nome!: number;

  @Column()
  public descricao!: string;

  /**
   * Aqui fica um relacionamento entre tabela, nesse caso não pega 
   * para ativar o relacionamento e preciso no join passar a class modelo nos joins
   * mais a baixo terá um exemplo
  */
  @OneToMany()
  public carro: Carro[] | null = null;

  constructor(pCliente: Partial<ICliente>) {
    this.id = pCliente.id ?? this.id;
    this.nome = pCliente.nome ?? this.nome;
    this.descricao = pCliente.descricao ?? this.descricao;
    this.contexto = pCliente.contexto ?? this.contexto;
  }

}

import { Column, EntityName, ManyToOne } from '@guilhermeabreudev/capacitor-orm-sqlite';

@EntityName('Carro') // nome da tabela 
export class Carro implements ICarro { // class modelo

  //coluna do banco de dados
  @Column({
    primaryKey: true
  })
  public id!: number;

  @Column()
  public marca!: number;

  @Column()
  public placa!: string;

  @Column()
  public id_cliente!: string;

  /**
   * Aqui fica um relacionamento entre tabela, nesse caso não pega 
   * para ativar o relacionamento e preciso no join passar a class modelo nos joins
   * mais a baixo terá um exemplo
  */
  @ManyToOne()
  public cliente: IClient | null = null;

  constructor(oCarro: Partial<ICarro>) {
    this.id = oCarro.id ?? this.id;
    this.marca = oCarro.marca ?? this.marca;
    this.placa = oCarro.placa ?? this.placa;
  }

}

import { DatabaseConnectionOrmSQlite, QueryBuildOrmSQlite } from '@guilhermeabreudev/capacitor-orm-sqlite';


class ControladorClienteRepositorio  {
    public async salvar(clientes: Cliente | Cliente[]): Promise<Cliente[]> {
        return await DatabaseConnectionOrmSQlite.query(
        new QueryBuildOrmSQlite(Cliente)
        .insert(clientes)
        )
    }

    public async listarTodos(): Promise<Cliente[]> {
        const clientes = await DatabaseConnectionOrmSQlite.query<ICliente>(new QueryBuildOrmSQlite(Cliente).getQuery())

        return clientes.map(cliente => new Cliente(cliente))
    }

    public async listarComCarros(id: number): Promise<Cliente[]> {
        
    const clientesComCarros = await DatabaseConnectionOrmSQlite.query<ICliente>(
        new QueryBuildOrmSQlite(Cliente)
        .leftJoin(Carro, 'id', 'id_cliente', 'carros');
        .where('id', id);
        .getQuery()
    )

    return clientesComCarros.map(cliente => new Cliente(cliente))
  }
}

```

Lembrando que a tipagem e dinâmica logo, ao inserir a class o plugin se encarrega de ler todas as propriedade e com isso retornar tudo sem precisar ficar tentando lembrar o que está na class.

Também e possível realizar migrações do banco com o tipo IMigrationDatabaseOrmSQLite

``DatabaseConnectionOrmSQlite.runMigrationsIfNeeded(MigrationDb)``

Veja tudo em (https://github.com/GuilhermeAbreu/orm-sqlite/tree/main/docs)

# Contribuição
Se você deseja contribuir para este projeto, por favor siga os seguintes passos:

Faça um fork do repositório.

Crie uma branch para suas alterações (git checkout -b minha-nova-feature).

Faça commit das suas alterações (git commit -am 'Adiciona nova feature').

Envie para o branch do repositório remoto (git push origin minha-nova-feature).

Abra um Pull Request para revisão.


# Licença
Este projeto está licenciado sob a Licença MIT.
Se precisar de mais ajustes ou detalhes, sinta-se à vontade para pedir!





