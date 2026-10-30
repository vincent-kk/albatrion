import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { equals } from '@winglet/common-utils/object';

import type { Optional } from '@aileron/declare';

import { FormErrorCode } from '@/schema-form/errors';
import { appendSegment } from '@/schema-form/helpers/jsonPointer';
import {
  EMPTY_INTERSECTION,
  intersectEnum,
} from '@/schema-form/helpers/schemaIntersection';

import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';
import { foldAllowedTypes } from '../../../../utils/nodeIdentity/foldAllowedTypes';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { intersectAllowedTypes } from '../../../utils/allowedTypes/intersectAllowedTypes';
import { readAllowedTypes } from '../../../utils/allowedTypes/readAllowedTypes';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { inferAllowedTypes } from '../nodeTypes/inferAllowedTypes';
import { collectStaticSchemas } from '../references/collectStaticSchemas';

/** Union keywords whose branches are checked for a shared discriminator. */
const UNION_KEYWORDS = ['oneOf', 'anyOf'] as const;

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
      FormErrorCode.InvalidControlShape,
      appendSegment(appendSegment(schemaPath, 'controls'), 'discriminator'),
      {
        group: SCHEMA_GROUP.controls,
        key: 'discriminator',
        expected: 'string',
      },
      context.options,
    );
  for (const keyword of UNION_KEYWORDS) {
    if (!isArray(host[keyword])) continue;
    let previousMask: Optional<number>;
    const previousValues: unknown[] = [];
    for (let index = 0; index < host[keyword].length; index++) {
      const branch = host[keyword][index];
      const branchPath = appendSegment(
        appendSegment(schemaPath, keyword),
        index,
      );
      const parts = collectStaticSchemas(context, branch, branchPath);
      let branchTypes: ReturnType<typeof readAllowedTypes>;
      for (const part of parts)
        branchTypes = intersectAllowedTypes(
          branchTypes,
          readAllowedTypes(part.schema, part.schemaPath, context.options),
        );
      let allMatch: Optional<boolean> = undefined;

      const branchTypeNames = branchTypes;
      if (branchTypeNames != null) {
        allMatch = true;
        for (
          let index = 0, count = branchTypeNames.length;
          index < count;
          index++
        ) {
          const type = branchTypeNames[index];

          if (!(type === 'null')) {
            allMatch = false;
            break;
          }
        }
      }

      if (allMatch) {
        continue;
      }
      let values: Optional<readonly unknown[]>;
      let mask: Optional<number>;
      for (const part of parts) {
        const property = readSchemaObject(part.schema).properties?.[
          propertyName
        ];
        if (property === undefined) continue;
        const propertyPath = appendSegment(
          appendSegment(part.schemaPath, 'properties'),
          propertyName,
        );
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
            hasOwnProperty(record, 'const') ? [record.const] : undefined,
          ];
          for (const restriction of restrictions) {
            if (!isArray(restriction)) continue;
            const intersection = intersectEnum(values, restriction, true);
            if (
              intersection === EMPTY_INTERSECTION ||
              intersection?.length === 0
            )
              return throwBlueprintError(
                FormErrorCode.EmptyEnumIntersection,
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
          FormErrorCode.DiscriminatorMismatch,
          branchPath,
          { propertyName, reason: 'kind' },
          context.options,
        );
      let hasOverlappingTag = false;
      for (
        let position = 0, limit = values.length;
        position < limit;
        position++
      ) {
        if (!(position in values)) {
          continue;
        }

        const value = values[position];
        let matchesPreviousTag = false;
        for (
          let index = 0, count = previousValues.length;
          index < count;
          index++
        ) {
          const previous = previousValues[index];

          if (equals(previous, value)) {
            matchesPreviousTag = true;
            break;
          }
        }
        if (matchesPreviousTag) {
          hasOverlappingTag = true;
          break;
        }
      }
      if (hasOverlappingTag) {
        return throwBlueprintError(
          FormErrorCode.DiscriminatorMismatch,
          branchPath,
          { propertyName, reason: 'overlap' },
          context.options,
        );
      }
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
      FormErrorCode.DiscriminatorMismatch,
      schemaPath,
      { propertyName, reason: 'missing' },
      context.options,
    );
  return result;
};
