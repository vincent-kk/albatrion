import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { JSONSchemaScanner } from '../../sync/JSONSchemaScanner';
import type { JSONScannerOptions } from '../../type';

/** Capture both callback phases and inert status so missed descendants cannot hide behind matching enters. */
export function visitPaths(
  schema: UnknownSchema,
  options: JSONScannerOptions = {},
) {
  const sequence: string[] = [],
    inert = new Map<string, boolean>();
  new JSONSchemaScanner({
    options,
    visitor: {
      enter: (entry) => {
        sequence.push('+' + entry.path);
        inert.set(entry.path, !!entry.inert);
      },
      exit: (entry) => sequence.push('-' + entry.path),
    },
  }).scan(schema);
  return { sequence, inert };
}
