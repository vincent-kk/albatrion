import { isArray } from '@winglet/common-utils/filter';
import { JSONSchemaScanner } from '@winglet/json-schema/scanner';

import type { BlueprintSchema } from '../../type';
import { STRIP_SCHEMA_KEYWORDS } from './constant';
import { copySchemaContainers } from './utils/copySchemaContainers';
import { removeFormGroups } from './utils/removeFormGroups';

/**
 * Prepare validator input by removing form-only groups at schema positions.
 * @param schema - Authored JSON Schema; literal data and unknown keywords remain data.
 * @returns The original when unchanged, otherwise an isolated stripped copy.
 * @remarks The scanner stops at unresolved references. Hide each reference during
 * traversal and restore it on exit so sibling schema locations are stripped too.
 */
export const stripSchema = (schema: BlueprintSchema): BlueprintSchema => {
  if (typeof schema === 'boolean') return schema;
  const references = new Map<object, string>();
  let changed = false;
  const result = new JSONSchemaScanner({
    options: {
      additionalKeywords: [...STRIP_SCHEMA_KEYWORDS],
      mutate: (entry) => {
        if (isArray(entry.schema)) return undefined;
        const stripped = removeFormGroups(entry);
        if (stripped !== undefined) changed = true;
        const value = stripped ?? entry.schema;
        if (!value || typeof value !== 'object') return stripped;
        const current = copySchemaContainers(value);
        if (
          current &&
          typeof current === 'object' &&
          typeof current.$ref === 'string'
        ) {
          const { $ref, ...replacement } = current;
          references.set(replacement, $ref);
          return replacement;
        }
        return current;
      },
    },
    visitor: {
      exit: ({ schema: current }) => {
        if (!current || typeof current !== 'object') return;
        const reference = references.get(current);
        if (reference !== undefined) current.$ref = reference;
      },
    },
  })
    .scan(schema)
    .getValue();
  return changed ? (result ?? schema) : schema;
};
