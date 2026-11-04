import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  joinPointerWithPrefixOf,
  parseStandardPointer,
  stripFragment,
} from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { isBlueprintSchema } from './isBlueprintSchema';

/**
 * Resolve a local authored reference without expanding its target.
 * @param context - Root-local analysis state
 * @param reference - Root-relative URI fragment reference
 * @param schemaPath - Referring location used for errors
 * @returns Target schema and canonical authored JSON Pointer
 */
export const resolveReference = (
  context: AnalysisContext,
  reference: string,
  schemaPath: string,
): { schema: BlueprintSchema; schemaPath: string } => {
  if (stripFragment(reference) === reference)
    return throwBlueprintError(
      FormErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        reference,
        guidance: 'References must resolve within the authored root.',
      },
      context.options,
    );
  let pointer: string;
  let schema: unknown;
  try {
    const names = parseStandardPointer(reference);
    pointer = joinPointerWithPrefixOf(reference, names);
    schema = context.schema;
    for (const name of names) {
      if (schema === null || typeof schema !== 'object') {
        schema = undefined;
        break;
      }
      schema = hasOwnProperty(schema, name)
        ? Reflect.get(schema, name)
        : undefined;
    }
  } catch (cause) {
    return throwBlueprintError(
      FormErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        reference,
        cause,
        guidance: 'The reference must be a valid local schema pointer.',
      },
      context.options,
    );
  }
  if (!isBlueprintSchema(schema))
    return throwBlueprintError(
      FormErrorCode.UnknownJsonSchema,
      schemaPath,
      { reference, guidance: 'The reference must identify a schema.' },
      context.options,
    );
  return { schema, schemaPath: pointer };
};
