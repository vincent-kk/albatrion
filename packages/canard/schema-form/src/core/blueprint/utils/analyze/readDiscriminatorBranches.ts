import { equals } from '@winglet/common-utils/object';
import { escapeSegment } from '@winglet/json/pointer';

import {
  EMPTY_INTERSECTION,
  intersectEnum,
} from '@/schema-form/helpers/schemaIntersection';

import type { BlueprintSchema } from '../../type';
import { BlueprintErrorCode } from '../diagnostics/constant';
import { throwBlueprintError } from '../diagnostics/throwBlueprintError';
import { foldAllowedTypes } from '../types/foldAllowedTypes';
import { inferAllowedTypes } from '../types/inferAllowedTypes';
import { intersectAllowedTypes } from '../types/intersectAllowedTypes';
import { readAllowedTypes } from '../types/readAllowedTypes';
import { collectStaticSchemas } from './collectStaticSchemas';
import { readSchemaObject } from './readSchemaObject';
import type { AnalysisContext } from './type';

/**
 * Read explicit discriminator tags from each branch's static conjunction.
 * @param context - Authored references and diagnostic collector
 * @param schema - Host carrying the explicit discriminator declaration
 * @param schemaPath - Authored host location
 * @returns Branch-location descriptors; branches lacking tags remain ungated
 */
export const readDiscriminatorBranches = (
  context: AnalysisContext,
  schema: BlueprintSchema,
  schemaPath: string,
): Map<string, { propertyName: string; values: readonly unknown[] }> => {
  const host = readSchemaObject(schema);
  const propertyName = host.controls?.discriminator;
  const result = new Map<
    string,
    { propertyName: string; values: readonly unknown[] }
  >();
  if (propertyName === undefined) return result;
  if (typeof propertyName !== 'string' || !propertyName.length)
    return throwBlueprintError(
      BlueprintErrorCode.DiscriminatorMismatch,
      schemaPath,
      { propertyName },
      context.options,
    );
  for (const keyword of ['oneOf', 'anyOf'] as const) {
    if (!Array.isArray(host[keyword])) continue;
    let previousMask: number | undefined;
    const previousValues: unknown[] = [];
    for (let index = 0; index < host[keyword].length; index++) {
      const branch = host[keyword][index];
      const branchPath = `${schemaPath}/${keyword}/${index}`;
      const parts = collectStaticSchemas(context, branch, branchPath);
      let branchTypes: ReturnType<typeof readAllowedTypes>;
      for (const part of parts)
        branchTypes = intersectAllowedTypes(
          branchTypes,
          readAllowedTypes(part.schema, part.schemaPath, context.options),
        );
      if (branchTypes?.every((type) => type === 'null')) continue;
      let values: readonly unknown[] | undefined;
      let mask: number | undefined;
      for (const part of parts) {
        const property = readSchemaObject(part.schema).properties?.[
          propertyName
        ];
        if (property === undefined) continue;
        const propertyPath = `${part.schemaPath}/properties/${escapeSegment(propertyName)}`;
        const types = inferAllowedTypes(context, property, propertyPath, true);
        if (types) mask = foldAllowedTypes(types);
        for (const tag of collectStaticSchemas(
          context,
          property,
          propertyPath,
        )) {
          const record = readSchemaObject(tag.schema);
          const restrictions = [
            record.enum,
            Object.prototype.hasOwnProperty.call(record, 'const')
              ? [record.const]
              : undefined,
          ];
          for (const restriction of restrictions) {
            if (!Array.isArray(restriction)) continue;
            const intersection = intersectEnum(values, restriction, true);
            if (
              intersection === EMPTY_INTERSECTION ||
              intersection?.length === 0
            )
              return throwBlueprintError(
                BlueprintErrorCode.EmptyEnumIntersection,
                tag.schemaPath,
                { propertyName },
                context.options,
              );
            values = intersection;
          }
        }
      }
      if (values === undefined) continue;
      if (
        mask !== undefined &&
        previousMask !== undefined &&
        mask !== previousMask
      )
        return throwBlueprintError(
          BlueprintErrorCode.DiscriminatorMismatch,
          branchPath,
          { propertyName, reason: 'kind' },
          context.options,
        );
      if (
        values.some((value) =>
          previousValues.some((previous) => equals(previous, value)),
        )
      )
        return throwBlueprintError(
          BlueprintErrorCode.DiscriminatorMismatch,
          branchPath,
          { propertyName, reason: 'overlap' },
          context.options,
        );
      previousMask = mask ?? previousMask;
      previousValues.push(...values);
      result.set(
        branchPath,
        Object.freeze({ propertyName, values: Object.freeze([...values]) }),
      );
    }
  }
  if (!result.size)
    return throwBlueprintError(
      BlueprintErrorCode.DiscriminatorMismatch,
      schemaPath,
      { propertyName, reason: 'missing' },
      context.options,
    );
  return result;
};
