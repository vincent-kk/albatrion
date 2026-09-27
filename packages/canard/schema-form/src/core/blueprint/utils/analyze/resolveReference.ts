import { getValue } from '@winglet/json/pointer';

import type { BlueprintSchema } from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
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
  if (!reference.startsWith('#'))
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        reference,
        guidance: 'References must resolve within the authored root.',
      },
      context.options,
    );
  let pointer: string;
  let schema: BlueprintSchema | undefined;
  try {
    pointer = decodeURIComponent(reference.slice(1));
    schema = getValue(context.schema as Record<string, unknown>, pointer) as
      | BlueprintSchema
      | undefined;
  } catch (cause) {
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        reference,
        cause,
        guidance: 'The reference must be a valid local schema pointer.',
      },
      context.options,
    );
  }
  if (
    schema === undefined ||
    (typeof schema !== 'boolean' &&
      (schema === null || typeof schema !== 'object'))
  )
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      { reference, guidance: 'The reference must identify a schema.' },
      context.options,
    );
  return { schema, schemaPath: `#${pointer}` };
};
