import { Column, EntityName } from '../../src/decoratiors/decoratiors.orm';

@EntityName('local_storage')
export class LocalStorage {
  @Column({ primaryKey: true })
  public id!: number;

  @Column()
  public key!: string;

  @Column()
  public value!: string;

  constructor(pLocaStorage: Partial<LocalStorage>) {
    this.id = pLocaStorage.id ?? this.id;
    this.key = pLocaStorage.key ?? this.key;
    this.value = pLocaStorage.value ?? this.value;
  }
}
