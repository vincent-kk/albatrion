import { DIALECT_FLAGS } from './dialectFlags';

/**
 * Recognize official metaschema URIs, normalizing the permitted scheme and empty fragment aliases.
 * @param uri Resource-root $schema string; unknown declarations inherit the enclosing dialect.
 * @returns A dialect bit, or undefined for an unknown declaration.
 */
export function detectDialect(uri: string): number | undefined {
  switch (uri.replace(/^https:/, 'http:').replace(/#$/, '')) {
    case 'http://json-schema.org/draft-04/schema':
      return DIALECT_FLAGS['draft-04'];
    case 'http://json-schema.org/draft-06/schema':
      return DIALECT_FLAGS['draft-06'];
    case 'http://json-schema.org/draft-07/schema':
      return DIALECT_FLAGS['draft-07'];
    case 'http://json-schema.org/draft/2019-09/schema':
      return DIALECT_FLAGS['2019-09'];
    case 'http://json-schema.org/draft/2020-12/schema':
      return DIALECT_FLAGS['2020-12'];
    default:
      return undefined;
  }
}
