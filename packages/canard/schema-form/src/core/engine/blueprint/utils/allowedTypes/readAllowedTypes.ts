import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import { FormErrorCode } from '../../../../../errors';
import type { BlueprintOptions } from '../../types/blueprint';
import type { BlueprintSchema, SchemaTypeName } from '../../types/schema';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { unionAllowedTypes } from './unionAllowedTypes';

/**
 * Parse one explicit type declaration without inferring meaning from value constraints.
 * @param schema - Authored object or boolean schema
 * @param schemaPath - Exact location for invalid syntax diagnostics
 * @param options - Optional error collector
 * @returns Accepted types including null, or undefined for absent type
 */
export const readAllowedTypes = (
  schema: BlueprintSchema,
  schemaPath: string,
  options?: BlueprintOptions,
): Optional<readonly SchemaTypeName[]> => {
  if (typeof schema === 'boolean' || schema.type === undefined)
    return undefined;
  const values = isArray(schema.type) ? schema.type : [schema.type];
  if (!isAllowedTypeList(values))
    return throwBlueprintError(
      FormErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        type: schema.type,
        guidance: 'Specify a nonempty type without duplicate or unknown names.',
      },
      options,
    );
  const result = [...values];
  if (schema.nullable === true && !result.includes('null')) result.push('null');
  return unionAllowedTypes([result]);
};

/** Explicit JSON Schema type names accepted by the form grammar. */
const TYPE_NAMES: readonly unknown[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'null',
  'object',
  'array',
];

/**
 * Narrow indexed type entries through the authored list's existing validation.
 * @param values - Raw list; the indexed check skips sparse slots
 * @returns Whether indexed validation accepts the list before its iterator is copied
 */
function isAllowedTypeList(
  values: readonly unknown[],
): values is readonly SchemaTypeName[] {
  let matches = !!values.length;
  if (matches) {
    let hasMatch = false;
    for (let index = 0, count = values.length; index < count; index++) {
      if (!(index in values)) {
        continue;
      }

      const value = values[index];

      if (!TYPE_NAMES.includes(value) || values.indexOf(value) !== index) {
        hasMatch = true;
        break;
      }
    }
    matches = !hasMatch;
  }
  return matches;
}
