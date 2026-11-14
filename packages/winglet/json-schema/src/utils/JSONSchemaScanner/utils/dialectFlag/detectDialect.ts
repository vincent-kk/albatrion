import { DialectFlag } from './DialectFlag';
import { normalizeSchemaUri } from './normalizeSchemaUri';

/** Official metaschema URI, in its normalized spelling, to the dialect it declares. */
const META_SCHEMA_DIALECTS: ReadonlyMap<string, DialectFlag> = new Map([
  ['http://json-schema.org/draft-04/schema', DialectFlag.Draft04],
  ['http://json-schema.org/draft-06/schema', DialectFlag.Draft06],
  ['http://json-schema.org/draft-07/schema', DialectFlag.Draft07],
  ['http://json-schema.org/draft/2019-09/schema', DialectFlag.Draft201909],
  ['http://json-schema.org/draft/2020-12/schema', DialectFlag.Draft202012],
]);

/**
 * Recognize official metaschema URIs, accepting the scheme and empty-fragment aliases.
 * @param uri Resource-root $schema string; unknown declarations inherit the enclosing dialect.
 * @returns A dialect bit, or undefined for an unknown declaration.
 */
export function detectDialect(uri: string): DialectFlag | undefined {
  return META_SCHEMA_DIALECTS.get(normalizeSchemaUri(uri));
}
