import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { resolveReference } from './resolveReference';

/** Shared frozen empty expansion path. */
const NO_VISITING: readonly string[] = Object.freeze([]);

/**
 * Collect a slot's static conjunction, cutting reference cycles within the slot.
 * @param context - Authored root and analysis dependencies
 * @param schema - Current schema declaration
 * @param schemaPath - Authored location of the declaration
 * @param visiting - Locations on this fragment expansion path
 * @param cycle - Optional observer of a reference or allOf path re-entry
 * @returns Ordered schema locations: body, reference target, ungated allOf
 */
export const collectStaticSchemas = (
  context: AnalysisContext,
  schema: BlueprintSchema,
  schemaPath: string,
  visiting: readonly string[] = NO_VISITING,
  cycle?: { found: boolean },
): { schema: BlueprintSchema; schemaPath: string }[] => {
  if (visiting.includes(schemaPath)) {
    if (cycle) cycle.found = true;
    return [];
  }
  const result = [{ schema, schemaPath }];
  if (typeof schema === 'boolean') return result;
  const stack = [...visiting, schemaPath];
  if (typeof schema.$ref === 'string') {
    const target = resolveReference(context, schema.$ref, schemaPath);
    result.push(
      ...collectStaticSchemas(
        context,
        target.schema,
        target.schemaPath,
        stack,
        cycle,
      ),
    );
  }

  if (isArray(schema.allOf)) {
    const allOfSchemas = schema.allOf;
    for (let index = 0, count = allOfSchemas.length; index < count; index++) {
      if (!(index in allOfSchemas)) continue;
      const part = allOfSchemas[index];

      const controls =
        typeof part === 'object' && part !== null ? part.controls : undefined;
      if (controls?.active === undefined)
        result.push(
          ...collectStaticSchemas(
            context,
            part,
            appendSegment(appendSegment(schemaPath, 'allOf'), index),
            stack,
            cycle,
          ),
        );
    }
  }
  return result;
};
