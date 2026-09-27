import type { BlueprintSchema, SchemaTypeName } from '../../type';
import { collectStaticSchemas } from '../analyze/collectStaticSchemas';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { intersectAllowedTypes } from './intersectAllowedTypes';
import { readAllowedTypes } from './readAllowedTypes';
import { unionAllowedTypes } from './unionAllowedTypes';

/**
 * Resolve S0-S3 for one authored slot without evaluating branch guards.
 * @param context - Root-local reference resolver and error collector
 * @param schema - Slot declaration, possibly untyped
 * @param schemaPath - Original schema location for diagnostics
 * @param allowTop - Permit a constraint-only declaration to remain unconstrained
 * @returns Ordered allowed types, or top for an untyped overlay when permitted
 */
export const inferAllowedTypes = (
  context: AnalysisContext,
  schema: BlueprintSchema,
  schemaPath: string,
  allowTop = false,
): readonly SchemaTypeName[] | undefined => {
  const parts = collectStaticSchemas(context, schema, schemaPath);
  let allowed: readonly SchemaTypeName[] | undefined;
  for (const part of parts) {
    allowed = intersectAllowedTypes(
      allowed,
      readAllowedTypes(part.schema, part.schemaPath, context.options),
    );
    if (allowed?.length === 0)
      return throwBlueprintError(
        BlueprintErrorCode.AllOfTypeRedefinition,
        part.schemaPath,
        { schema },
        context.options,
      );
  }
  if (allowed) return allowed;
  let inferred: readonly SchemaTypeName[] | undefined;
  for (const keyword of ['oneOf', 'anyOf'] as const) {
    const groups: (readonly SchemaTypeName[])[] = [];
    for (const part of parts) {
      if (typeof part.schema === 'boolean') continue;
      const branches = part.schema[keyword];
      if (!Array.isArray(branches)) continue;
      branches.forEach((branch, index) => {
        if (branch?.controls?.active !== undefined) return;
        const path = `${part.schemaPath}/${keyword}/${index}`;
        const types = inferAllowedTypes(context, branch, path, true);
        if (!types || types.includes('object') || types.includes('array'))
          return throwBlueprintError(
            BlueprintErrorCode.UnknownJsonSchema,
            path,
            {
              guidance:
                'Specify type explicitly; untyped branches require explicit primitive types.',
            },
            context.options,
          );
        groups.push(types);
      });
    }
    if (groups.length)
      inferred = intersectAllowedTypes(inferred, unionAllowedTypes(groups));
  }
  if (inferred?.length) return inferred;
  if (allowTop && inferred === undefined) return undefined;
  return throwBlueprintError(
    BlueprintErrorCode.UnknownJsonSchema,
    schemaPath,
    {
      guidance:
        'Specify type explicitly; no nonempty primitive branch union determines this slot.',
    },
    context.options,
  );
};
