import * as legacyDecorators from '../src/decoratiors/decoratiors.orm';
import * as modernDecorators from '../src/decorators/decorators.orm';
import * as legacyMetadata from '../src/metadata/geranciado.metadata';
import * as modernMetadata from '../src/metadata/gerenciado.metadata';

describe('Path aliases', () => {
  it('should expose same decorators module through legacy and modern paths', () => {
    expect(modernDecorators.Column).toBe(legacyDecorators.Column);
    expect(modernDecorators.EntityName).toBe(legacyDecorators.EntityName);
    expect(modernDecorators.ManyToOne).toBe(legacyDecorators.ManyToOne);
  });

  it('should expose same metadata module through legacy and modern paths', () => {
    expect(modernMetadata.defineMetadata).toBe(legacyMetadata.defineMetadata);
    expect(modernMetadata.getMetadata).toBe(legacyMetadata.getMetadata);
    expect(modernMetadata.getMetadataAllByName).toBe(legacyMetadata.getMetadataAllByName);
  });
});
