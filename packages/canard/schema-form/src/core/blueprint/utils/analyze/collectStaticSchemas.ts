import type { BlueprintSchema } from '../../type';
import { resolveReference } from './resolveReference';
import type { AnalysisContext } from './type';

/**
 * Collect a slot's static conjunction, cutting reference cycles within the slot.
 * @param context - Authored root and analysis dependencies
 * @param schema - Current schema declaration
 * @param schemaPath - Authored location of the declaration
 * @param visiting - Locations on this fragment expansion path
 * @returns Ordered schema locations: body, reference target, ungated allOf
 */
export const collectStaticSchemas = (
  context: AnalysisContext,
  schema: BlueprintSchema,
  schemaPath: string,
  visiting: readonly string[] = [],
): { schema: BlueprintSchema; schemaPath: string }[] => {
  if (visiting.includes(schemaPath)) return [];
  const result = [{ schema, schemaPath }];
  if (typeof schema === 'boolean') return result;
  const stack = [...visiting, schemaPath];
  if (typeof schema.$ref === 'string') {
    const target = resolveReference(context, schema.$ref, schemaPath);
    result.push(
      ...collectStaticSchemas(context, target.schema, target.schemaPath, stack),
    );
  }
  if (Array.isArray(schema.allOf))
    schema.allOf.forEach((part, index) => {
      const controls =
        typeof part === 'object' && part !== null ? part.controls : undefined;
      if (controls?.active === undefined)
        result.push(
          ...collectStaticSchemas(
            context,
            part,
            `${schemaPath}/allOf/${index}`,
            stack,
          ),
        );
    });
  return result;
};
