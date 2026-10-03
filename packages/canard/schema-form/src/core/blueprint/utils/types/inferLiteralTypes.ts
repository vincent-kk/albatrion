import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintSchema, SchemaTypeName } from '../../type';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';

/**
 * Infer branchless primitive/null kinds from authored const and enum literals.
 * @param context - Diagnostic collector for unsupported literal kinds
 * @param parts - The slot's static conjunction, in authored order
 * @param schemaPath - Slot location for a mixed or non-primitive literal error
 * @returns Ordered literal kinds, or undefined when no literal is present
 */
export const inferLiteralTypes = (
  context: AnalysisContext,
  parts: readonly { schema: BlueprintSchema; schemaPath: string }[],
  schemaPath: string,
): readonly SchemaTypeName[] | undefined => {
  const values: unknown[] = [];
  let hasLiteral = false;
  for (const part of parts) {
    if (typeof part.schema === 'boolean') continue;
    if (hasOwnProperty(part.schema, 'const')) {
      values.push(part.schema.const);
      hasLiteral = true;
    }
    if (hasOwnProperty(part.schema, 'enum')) {
      hasLiteral = true;
      if (!isArray(part.schema.enum))
        return throwBlueprintError(
          BlueprintErrorCode.UnknownJsonSchema,
          part.schemaPath,
          { guidance: 'Specify type explicitly for an invalid enum literal.' },
          context.options,
        );
      values.push(...part.schema.enum);
    }
  }
  if (!hasLiteral) return undefined;
  const types: SchemaTypeName[] = [];
  for (const value of values) {
    const type = value === null ? 'null' : typeof value;
    if (
      type !== 'string' &&
      type !== 'number' &&
      type !== 'boolean' &&
      type !== 'null'
    )
      return throwBlueprintError(
        BlueprintErrorCode.UnknownJsonSchema,
        schemaPath,
        { guidance: 'Specify type explicitly for an object or array literal.' },
        context.options,
      );
    if (!types.includes(type as SchemaTypeName))
      types.push(type as SchemaTypeName);
  }
  if (types.filter((type) => type !== 'null').length === 1 && types.length > 0)
    return types;
  if (types.length === 1 && types[0] === 'null') return types;
  return throwBlueprintError(
    BlueprintErrorCode.UnknownJsonSchema,
    schemaPath,
    { guidance: 'Specify type explicitly for mixed or empty literals.' },
    context.options,
  );
};
