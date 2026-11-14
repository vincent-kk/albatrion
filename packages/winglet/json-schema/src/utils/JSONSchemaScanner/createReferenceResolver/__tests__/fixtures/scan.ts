import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScanner } from '../../../sync';
import type { JSONScannerOptions, ReferenceOutcome } from '../../../utils/type';
import { createReferenceResolver } from '../../createReferenceResolver';
import type { ReferenceResolverOptions } from '../../utils/type';

/** Scan a fixture with its original document indexed and capture completed outcomes by path. */
export function scan(
  schema: UnknownSchema | boolean,
  options: JSONScannerOptions = {},
  resolverOptions: ReferenceResolverOptions = {},
) {
  const outcomes = new Map<string, ReferenceOutcome[]>();
  const scanner = new JSONSchemaScanner({
    options: {
      resolveReference: createReferenceResolver(schema, resolverOptions),
      ...options,
    },
    visitor: {
      exit: (entry) => {
        if (entry.references) outcomes.set(entry.path, entry.references);
      },
    },
  });
  return { output: scanner.scan(schema).getValue<UnknownSchema>()!, outcomes };
}
