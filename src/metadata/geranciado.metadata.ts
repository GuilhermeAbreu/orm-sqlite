const metadataStore: Record<string, any> = {};

// Definindo metadados
export function defineMetadata(target: any, propertyKey: string | symbol, metadataKey: string, metadataValue: any): void {
  const className = target.constructor.entityName;
  if (!metadataStore[className]) {
    metadataStore[className] = {};
  }
  if (!metadataStore[className][propertyKey]) {
    metadataStore[className][propertyKey] = {};
  }
  metadataStore[className][propertyKey][metadataKey] = metadataValue;
}

export function getMetadata(target: any, propertyKey: string | symbol, metadataKey: string): any {
  const className = target.constructor.entityName;
  return metadataStore[className]?.[propertyKey]?.[metadataKey];
}

export function getMetadataAllByName(target: any): any {
  const className = target.constructor.entityName;
  return metadataStore[className];
}

// Definindo o nome da entidade
export function defineClassMetadata(target: any, metadataKey: string, metadataValue: any): void {
  const className = target.entityName;
  if (!metadataStore[className]) {
    metadataStore[className] = {};
  }
  metadataStore[className][metadataKey] = metadataValue;
}

export function getClassMetadata(target: any, metadataKey: string) : any {
  const className = target.entityName;
  return metadataStore[className]?.[metadataKey];
}
