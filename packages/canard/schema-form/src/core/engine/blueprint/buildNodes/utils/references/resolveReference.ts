import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  joinPointerWithPrefixOf,
  parseStandardPointer,
} from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { isBlueprintSchema } from './isBlueprintSchema';
import { getResourceIndex } from './resources/getResourceIndex';
import { resolveResourceReference } from './resources/resolveResourceReference';

/**
 * Resolve a local authored reference without expanding its target.
 * @param context - Root-local analysis state
 * @param reference - URI reference relative to the enclosing resource
 * @param schemaPath - Referring location used for errors
 * @returns Target schema and canonical authored JSON Pointer
 */
export const resolveReference = (
  context: AnalysisContext,
  reference: string,
  schemaPath: string,
): { schema: BlueprintSchema; schemaPath: string } => {
  let pointer: string;
  let schema: unknown;
  try {
    if (context.resourceIndex || !reference.startsWith('#'))
      return resolveResourceReference(context, reference, schemaPath);
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
      if (
        schema &&
        typeof schema === 'object' &&
        typeof Reflect.get(schema, '$id') === 'string'
      )
        getResourceIndex(context);
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
