import { getValue } from '@winglet/json/pointer';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../errors';
import type { BlueprintSchema } from '../../type';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { isBlueprintSchema } from '../types/isBlueprintSchema';
import type { AnalysisContext } from './type';

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
  if (!reference.startsWith($.Fragment))
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
    pointer = decodeURIComponent(reference.slice(1));
    schema = getValue(context.schema, pointer);
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
  return { schema, schemaPath: '#' + pointer };
};
