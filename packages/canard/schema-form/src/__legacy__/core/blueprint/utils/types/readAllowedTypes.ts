import { isArray } from '@winglet/common-utils/filter';

import type {
  BlueprintOptions,
  BlueprintSchema,
  SchemaTypeName,
} from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
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
): readonly SchemaTypeName[] | undefined => {
  if (typeof schema === 'boolean' || schema.type === undefined)
    return undefined;
  const values = isArray(schema.type) ? schema.type : [schema.type];
  if (
    !values.length ||
    values.some(
      (value, index) =>
        !TYPE_NAMES.includes(value) || values.indexOf(value) !== index,
    )
  )
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        type: schema.type,
        guidance: 'Specify a nonempty type without duplicate or unknown names.',
      },
      options,
    );
  const result = [...values] as SchemaTypeName[];
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
