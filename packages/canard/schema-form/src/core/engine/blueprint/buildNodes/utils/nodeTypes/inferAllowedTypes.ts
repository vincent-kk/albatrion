import { map as mapArray } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import { foldAllowedTypes } from '../../../../utils/nodeIdentity/foldAllowedTypes';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema, SchemaTypeName } from '../../../types/schema';
import { intersectAllowedTypes } from '../../../utils/allowedTypes/intersectAllowedTypes';
import { readAllowedTypes } from '../../../utils/allowedTypes/readAllowedTypes';
import { unionAllowedTypes } from '../../../utils/allowedTypes/unionAllowedTypes';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { collectStaticSchemas } from '../references/collectStaticSchemas';
import { inferLiteralTypes } from './inferLiteralTypes';

/** Shared frozen result for a branch cut by recursion. */
const NO_TYPES: readonly SchemaTypeName[] = Object.freeze([]);

/** Shared frozen empty inference path. */
const NO_VISITING: readonly string[] = Object.freeze([]);

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
  visiting: readonly string[] = NO_VISITING,
  isBranch = false,
): Optional<readonly SchemaTypeName[]> => {
  if (visiting.includes(schemaPath)) return NO_TYPES;
  const cycle = isBranch ? { found: false } : undefined;
  const parts = collectStaticSchemas(
    context,
    schema,
    schemaPath,
    NO_VISITING,
    cycle,
  );
  const previousResult = isBranch && cycle?.found;
  let matchesEither: boolean;
  if (!previousResult) {
    matchesEither = false;
    for (let index = 0, count = parts.length; index < count; index++) {
      const part = parts[index];

      if (visiting.includes(part.schemaPath)) {
        matchesEither = true;
        break;
      }
    }
  } else {
    matchesEither = previousResult;
  }
  if (matchesEither) {
    return NO_TYPES;
  }
  const stack = [...visiting, ...mapArray(parts, (part) => part.schemaPath)];
  let allowed: Optional<readonly SchemaTypeName[]>;
  for (const part of parts) {
    allowed = intersectAllowedTypes(
      allowed,
      readAllowedTypes(part.schema, part.schemaPath, context.options),
    );
    if (allowed?.length === 0)
      return throwBlueprintError(
        FormErrorCode.AllOfTypeRedefinition,
        part.schemaPath,
        { schema },
        context.options,
      );
  }
  if (allowed) return allowed;
  let inferred: Optional<readonly SchemaTypeName[]>;
  let hasUngatedBranch = false;
  for (const keyword of BRANCH_KEYWORDS) {
    const groups: (readonly SchemaTypeName[])[] = [];
    let hasKeywordBranch = false;
    for (const part of parts) {
      if (typeof part.schema === 'boolean') continue;
      const branches = part.schema[keyword];
      if (!isArray(branches)) continue;
      for (let index = 0, count = branches.length; index < count; index++) {
        if (!(index in branches)) continue;
        const branch = branches[index];

        {
          const path = appendSegment(
            appendSegment(part.schemaPath, keyword),
            index,
          );
          if (
            branch?.controls?.active !== undefined ||
            context.discriminatorBranches?.has(path)
          ) {
            continue;
          }
          hasKeywordBranch = true;
          const types = inferAllowedTypes(
            context,
            branch,
            path,
            true,
            stack,
            true,
          );
          if (!types) {
            void throwBlueprintError(
              FormErrorCode.UnknownJsonSchema,
              path,
              {
                guidance:
                  'Specify type explicitly for an unconstrained branch.',
              },
              context.options,
            );
            continue;
          }
          if (types.length) groups.push(types);
        }
      }
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
        FormErrorCode.UnknownJsonSchema,
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
    FormErrorCode.UnknownJsonSchema,
    schemaPath,
    {
      guidance:
        'Specify type explicitly; no nonempty branch union or primitive literal determines this slot.',
    },
    context.options,
  );
};
