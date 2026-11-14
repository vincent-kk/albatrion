import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import {
  JSONSchemaScanner,
  createReferenceResolver,
} from '../JSONSchemaScanner';
import type { ReferenceResolverOptions } from '../JSONSchemaScanner';

/**
 * Resolve a document in one public scan using the built-in indexed provider.
 * @param schema Original JSON schema or boolean root.
 * @param options Explicit source, dialect and vocabulary configuration.
 * @returns Processed schema without modifying the original; unsafe or cyclic references may remain.
 */
export function resolveReference(
  schema: UnknownSchema | boolean,
  options: ReferenceResolverOptions = {},
): UnknownSchema | boolean | undefined {
  return new JSONSchemaScanner({
    options: {
      resolveReference: createReferenceResolver(schema, options),
      keywords: options.keywords,
      additionalKeywords: options.additionalKeywords,
      defaultDialect: options.defaultDialect,
    },
  })
    .scan(schema)
    .getValue();
}
