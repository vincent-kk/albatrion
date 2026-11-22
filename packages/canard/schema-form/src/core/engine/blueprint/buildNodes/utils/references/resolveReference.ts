import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  JSONPointer,
  joinPointerWithPrefixOf,
  parseStandardPointer,
  rebasePointer,
} from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { isBlueprintSchema } from './isBlueprintSchema';
import { getResourceIndex } from './resources/getResourceIndex';

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
  let schema: unknown = context.schema;
  let resourcePath: string | undefined;
  try {
    let fragment = reference;
    if (context.resourceIndex || reference[0] !== JSONPointer.Fragment) {
      const index = getResourceIndex(context);
      const scope = index.scopes.get(schemaPath) ?? index.scopes.get('#');
      if (!scope) throw new Error('The referring schema has no resource base.');
      const uri = new URL(reference, scope.uri);
      fragment = uri.hash || '#';
      uri.hash = '';
      const resource = index.resources.get(uri.href.replace(/#$/, ''));
      if (!resource)
        throw new Error('The resource is outside the authored document.');
      schema = resource.schema;
      resourcePath = resource.schemaPath;
    }
    const names = parseStandardPointer(fragment);
    pointer = joinPointerWithPrefixOf(fragment, names);
    for (const name of names) {
      if (
        schema === null ||
        typeof schema !== 'object' ||
        !hasOwnProperty(schema, name)
      ) {
        schema = undefined;
        break;
      }
      schema = Reflect.get(schema, name);
      if (
        resourcePath === undefined &&
        schema &&
        typeof schema === 'object' &&
        (typeof Reflect.get(schema, '$id') === 'string' ||
          typeof Reflect.get(schema, 'id') === 'string')
      )
        getResourceIndex(context);
    }
    if (resourcePath !== undefined)
      pointer = rebasePointer(pointer, '#', resourcePath);
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
      resourcePath === undefined
        ? { reference, guidance: 'The reference must identify a schema.' }
        : {
            reference,
            cause: new Error('The reference must identify a schema.'),
            guidance: 'The reference must be a valid local schema pointer.',
          },
      context.options,
    );
  return { schema, schemaPath: pointer };
};
