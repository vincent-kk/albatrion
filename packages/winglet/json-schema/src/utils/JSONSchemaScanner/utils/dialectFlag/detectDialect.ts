import { DialectFlag } from './DialectFlag';
import { normalizeSchemaUri } from './normalizeSchemaUri';

/** Official metaschema URI, including ordinary scheme and empty-fragment aliases, to its dialect. */
const META_SCHEMA_DIALECTS: Map<string, DialectFlag> = new Map([
  ['http://json-schema.org/draft-04/schema', DialectFlag.Draft04],
  ['http://json-schema.org/draft-06/schema', DialectFlag.Draft06],
  ['http://json-schema.org/draft-07/schema', DialectFlag.Draft07],
  ['http://json-schema.org/draft/2019-09/schema', DialectFlag.Draft201909],
  ['http://json-schema.org/draft/2020-12/schema', DialectFlag.Draft202012],
]);

for (const [uri, dialect] of META_SCHEMA_DIALECTS) {
  if (uri.startsWith('https:') || uri.endsWith('#')) continue;
  META_SCHEMA_DIALECTS.set(uri + '#', dialect);
  const secure = 'https:' + uri.slice(5);
  META_SCHEMA_DIALECTS.set(secure, dialect);
  META_SCHEMA_DIALECTS.set(secure + '#', dialect);
}

/**
 * Recognize official metaschema URIs, accepting the scheme and empty-fragment aliases.
 * @param uri Resource-root $schema string; unknown declarations inherit the enclosing dialect.
 * @returns A dialect bit, or undefined for an unknown declaration.
 */
export function detectDialect(uri: string): DialectFlag | undefined {
  return (
    META_SCHEMA_DIALECTS.get(uri) ??
    META_SCHEMA_DIALECTS.get(normalizeSchemaUri(uri))
  );
}
