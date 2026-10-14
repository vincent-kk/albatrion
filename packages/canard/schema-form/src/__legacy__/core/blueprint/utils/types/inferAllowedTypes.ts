import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintSchema, SchemaTypeName } from '../../type';
import { collectStaticSchemas } from '../analyze/collectStaticSchemas';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { foldAllowedTypes } from './foldAllowedTypes';
import { inferLiteralTypes } from './inferLiteralTypes';
import { intersectAllowedTypes } from './intersectAllowedTypes';
import { readAllowedTypes } from './readAllowedTypes';
import { unionAllowedTypes } from './unionAllowedTypes';

/** Authored disjunctions examined in S3 order without per-call allocation. */
const BRANCH_KEYWORDS = ['oneOf', 'anyOf'] as const;

/**
 * Resolve S0-S3 for one authored slot without evaluating branch guards.
 * @param context - Root-local reference resolver and error collector
 * @param schema - Slot declaration, possibly untyped
 * @param schemaPath - Original schema location for diagnostics
 * @param allowTop - Permit a constraint-only declaration to remain unconstrained
 * @param visiting - Schema locations on this branch-inference path
 * @param isBranch - Preserve top for a branch without type or nested branches
 * @returns Ordered allowed types, top for an unconstrained overlay, or empty for a cut recursive branch
 */
export const inferAllowedTypes = (
  context: AnalysisContext,
  schema: BlueprintSchema,
  schemaPath: string,
  allowTop = false,
  visiting: readonly string[] = [],
  isBranch = false,
): readonly SchemaTypeName[] | undefined => {
  if (visiting.includes(schemaPath)) return [];
  const cycle = isBranch ? { found: false } : undefined;
  const parts = collectStaticSchemas(context, schema, schemaPath, [], cycle);
  if (
    (isBranch && cycle?.found) ||
    parts.some((part) => visiting.includes(part.schemaPath))
  )
    return [];
  const stack = [...visiting, ...parts.map((part) => part.schemaPath)];
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
  let hasUngatedBranch = false;
  for (const keyword of BRANCH_KEYWORDS) {
    const groups: (readonly SchemaTypeName[])[] = [];
    let hasKeywordBranch = false;
    for (const part of parts) {
      if (typeof part.schema === 'boolean') continue;
      const branches = part.schema[keyword];
      if (!isArray(branches)) continue;
      branches.forEach((branch, index) => {
        const path = `${part.schemaPath}/${keyword}/${index}`;
        if (
          branch?.controls?.active !== undefined ||
          context.discriminatorBranches?.has(path)
        )
          return;
        hasKeywordBranch = true;
        const types = inferAllowedTypes(context, branch, path, true, stack, true);
        if (!types)
          return throwBlueprintError(
            BlueprintErrorCode.UnknownJsonSchema,
            path,
            {
              guidance:
                'Specify type explicitly for an unconstrained branch.',
            },
            context.options,
          );
        if (types.length) groups.push(types);
      });
    }
    if (hasKeywordBranch) {
      hasUngatedBranch = true;
      inferred = intersectAllowedTypes(inferred, unionAllowedTypes(groups));
    }
  }
  if (inferred?.length) {
    const kindMask = foldAllowedTypes(inferred);
    if ((kindMask & 24) !== 0 && kindMask !== 8 && kindMask !== 16)
      return throwBlueprintError(
        BlueprintErrorCode.UnknownJsonSchema,
        schemaPath,
        {
          guidance:
            'Specify type explicitly for object or array branches mixed with another kind.',
        },
        context.options,
      );
    return inferred;
  }
  if (!hasUngatedBranch && !isBranch) {
    const literals = inferLiteralTypes(context, parts, schemaPath);
    if (literals) return literals;
  }
  if (allowTop && inferred === undefined) return undefined;
  return throwBlueprintError(
    BlueprintErrorCode.UnknownJsonSchema,
    schemaPath,
    {
      guidance:
        'Specify type explicitly; no nonempty branch union or primitive literal determines this slot.',
    },
    context.options,
  );
};
