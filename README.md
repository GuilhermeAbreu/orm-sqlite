markdown

# ORM SQLite para Capacitor
[![CI](https://github.com/GuilhermeAbreu/orm-sqlite/actions/workflows/ci.yml/badge.svg)](https://github.com/GuilhermeAbreu/orm-sqlite/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-jest-blue)](#)

Este projeto é uma biblioteca ORM SQLite para uso com Capacitor, facilitando a integração e manipulação de bancos de dados SQLite em aplicativos móveis.

https://www.npmjs.com/package/@capacitor-community/sqlite

## Instalação

Para instalar o pacote `@guilhermeabreudev/capacitor-orm-sqlite`, execute o seguinte comando:

```bash
npm install @guilhermeabreudev/capacitor-orm-sqlite
```

Validação local completa:

```bash
npm run ci
```

## Nomenclatura recomendada (compatível com legado)

A biblioteca mantém nomes legados por compatibilidade, mas a recomendação para novos projetos é usar os aliases com grafia corrigida:

- `DatabaseConnectionOrmSQLite` (recomendado) e `DatabaseConnectionOrmSQlite` (legado)
- `QueryBuildOrmSQLite` (recomendado) e `QueryBuildOrmSQlite` (legado)
- `QueryBuildSQLite` (recomendado) e `QueryBuildSQlite` (legado)

Os dois formatos funcionam atualmente.

Configuração
1. Adicionar o capacitor-orm-sqlite ao Projeto
Adicione o capacitor-orm-sqlite ao seu projeto Capacitor. Certifique-se de que o capacitor-orm-sqlite está registrado corretamente.

Configurações de SQLite
https://github.com/capacitor-community/sqlite/blob/master/README.md

Criação da conexão apenas uma única vez no arquivo inicial do seu projeto.

Angular: app-component.ts
```typescript
new DatabaseConnectionOrmSQLite(
    new SQLiteConnection(CapacitorSQLite),
    'Nome do banco',
    'tipo de criptografia',
    'modo de criptografia',
    {{versão: number}},
    {{somenteLeitura: boolean}}
    {{MostrarSQlLog: boolean}}
)
```
o capacitor-orm-sqlite ficará responsável por gerenciar todo a parte de conexão, com isso não se preocupe em abrir ou fechar uma nova conexão.

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

import { DatabaseConnectionOrmSQLite, QueryBuildOrmSQLite } from '@guilhermeabreudev/capacitor-orm-sqlite';


class ControladorClienteRepositorio  {
    public async salvar(clientes: Cliente | Cliente[]): Promise<Cliente[]> {
        const query = new QueryBuildOrmSQLite(Cliente).insertWithParams(clientes);
        return await DatabaseConnectionOrmSQLite.executeWithParams(query.sql, query.params)
    }

    public async listarTodos(): Promise<Cliente[]> {
        const query = new QueryBuildOrmSQLite(Cliente).getQueryWithParams();
        const clientes = await DatabaseConnectionOrmSQLite.queryWithParams<ICliente>(query.sql, query.params)

        return clientes.map(cliente => new Cliente(cliente))
    }

    public async listarComCarros(id: number): Promise<Cliente[]> {
      const query = new QueryBuildOrmSQLite(Cliente)
        .leftJoin(Carro, 'id', 'id_cliente', 'carros')
        .where('id', id)
        .getQueryWithParams();

      const clientesComCarros = await DatabaseConnectionOrmSQLite.queryWithParams<ICliente>(
        query.sql,
        query.params
      );

      return clientesComCarros.map(cliente => new Cliente(cliente))
    }
}

```

Lembrando que a tipagem e dinâmica logo, ao inserir a class o capacitor-orm-sqlite se encarrega de ler todas as propriedade e com isso retornar tudo sem precisar ficar tentando lembrar o que está na class.

Também e possível realizar migrações do banco com o tipo IMigrationDatabaseOrmSQLite

``DatabaseConnectionOrmSQLite.runMigrationsIfNeeded(MigrationDb)``

Veja tudo em (https://github.com/GuilhermeAbreu/orm-sqlite/tree/main/docs)

Guia de troubleshooting:
- `docs/TROUBLESHOOTING.md`
- `docs/UPGRADE.md`

## Códigos de erro (`OrmSQLiteError`)

A biblioteca expõe erros padronizados com a classe `OrmSQLiteError` e a propriedade `code`, para facilitar tratamento no app.

| code | Quando acontece |
| --- | --- |
| `ERR_SQLITE_NOT_CONFIGURED` | Conexão SQLite não foi inicializada antes de executar query/execute |
| `ERR_DATABASE_NAME_NOT_CONFIGURED` | Nome do banco não foi configurado |
| `ERR_INVALID_CONFIG` | Configuração inválida de conexão (ex.: `mode` ou `version`) |
| `ERR_EMPTY_SQL` | SQL vazio foi enviado para `query`/`execute` |
| `ERR_INVALID_MIGRATIONS` | Migrations vazias, duplicadas ou fora de ordem |
| `ERR_MIGRATION_NOT_FOUND` | Versão de migration esperada não existe na lista |
| `ERR_UNSAFE_IDENTIFIER` | Nome de tabela/coluna/índice inválido ou inseguro |
| `ERR_INVALID_COLUMN` | Coluna usada sem decorator `@Column` |
| `ERR_TABLE_NAME_NOT_INFORMED` | Classe de modelo sem `@EntityName` ou `entityName` |
| `ERR_PRIMARY_KEY_NOT_FOUND` | Operação que exige chave primária em modelo sem coluna `primaryKey` |

Exemplo de tratamento:

```typescript
import { OrmSQLiteError } from '@guilhermeabreudev/capacitor-orm-sqlite';

try {
  await DatabaseConnectionOrmSQLite.executeWithParams('SELECT * FROM user WHERE id = ?', [1]);
} catch (error) {
  if (error instanceof OrmSQLiteError) {
    switch (error.code) {
      case 'ERR_EMPTY_SQL':
        // informar ao usuário ou corrigir fluxo de geração da query
        break;
      case 'ERR_INVALID_MIGRATIONS':
        // bloquear startup e logar configuração de migrations
        break;
      default:
        // fallback para observabilidade
        break;
    }
  }
}
```

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
