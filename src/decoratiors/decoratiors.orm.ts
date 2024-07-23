import { defineMetadata, getMetadata, getMetadataAllByName } from '../metadata/geranciado.metadata';

// Decorador para nome da entidade
export function EntityName(name: string): ClassDecorator {
    return function (constructor: any) {
      constructor.entityName = name;
      if (constructor.prototype.propertyActions) {
        for (const action of constructor.prototype.propertyActions) {
          action();
        }
      }
    };
  }
  
  // Decorador para colunas
  export function Column(pOpcao: { primaryKey?: boolean } = { primaryKey: false }): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
      if (!target.constructor.prototype.propertyActions) {
        target.constructor.prototype.propertyActions = [];
      }
      target.constructor.prototype.propertyActions.push(() => {
        defineMetadata(target, propertyKey, 'isColumn', true);
        if (pOpcao.primaryKey) {
          defineMetadata(target, propertyKey, 'isPrimaryKey', true);
        }
      });
    };
  }
  
  // Decorador para relacionamentos
  export function ManyToOne(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
      target.constructor.prototype.propertyActions.push(() => {
        defineMetadata(target, propertyKey, 'isManyToOne', true);
      });
    };
  }
  
  export function OneToMany(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
      target.constructor.prototype.propertyActions.push(() => {
        defineMetadata(target, propertyKey, 'isOneToMany', true);
      });
    };
  }
  
  export function OneToOne(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
      target.constructor.prototype.propertyActions.push(() => {
        defineMetadata(target, propertyKey, 'isOneToOne', true);
      });
    };
  }
  
  export function ManyToMany(): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol) {
      target.constructor.prototype.propertyActions.push(() => {
        defineMetadata(target, propertyKey, 'isManyToMany', true);
      });
    };
  }
  
  export function isPrimaryKey(target: any, propertyKey: string | symbol): boolean {
    const result = getMetadata(target, propertyKey, 'isPrimaryKey');
    return !!result;
  }
  
  export function getPrimaryKey<T>(target: any): keyof T {
    const chavePrimaria: any = getMetadataAllByName(target);
    for (const key in chavePrimaria) {
      if (chavePrimaria[key]?.isPrimaryKey) {
        return key as keyof T;
      }
    }
    throw new Error(`Primary key not found in class '${target.constructor.entityName}'`);
  }
  
  export function isColumn(target: any, propertyKey: string | symbol): boolean {
    const result = getMetadata(target, propertyKey, 'isColumn');
    return !!result;
  }
  
  export function isManyToOne(target: any, propertyKey: string | symbol): boolean {
    const result = getMetadata(target, propertyKey, 'isManyToOne');
    return !!result;
  }
  
  export function isOneToMany(target: any, propertyKey: string | symbol): boolean {
    const result = getMetadata(target, propertyKey, 'isOneToMany');
    return !!result;
  }
  
  export function isOneToOne(target: any, propertyKey: string | symbol): boolean {
    const result = getMetadata(target, propertyKey, 'isOneToOne');
    return !!result;
  }
  
  export function isManyToMany(target: any, propertyKey: string | symbol): boolean {
    const result = getMetadata(target, propertyKey, 'isManyToMany');
    return !!result;
  }
  
  export function isColunaRelacionamento(target: any, propertyKey: string | symbol): boolean {
    return (
      isManyToOne(target, propertyKey) ||
      isOneToMany(target, propertyKey) ||
      isOneToOne(target, propertyKey) ||
      isManyToMany(target, propertyKey)
    );
  }
  