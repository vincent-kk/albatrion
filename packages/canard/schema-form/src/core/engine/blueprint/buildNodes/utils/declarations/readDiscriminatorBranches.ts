import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { equals } from '@winglet/common-utils/object';

import type { Optional } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';
import { RESERVED_SCHEMA_KEYS } from '@/schema-form/constants/reservedSchemaKeys';
import { FormErrorCode } from '@/schema-form/errors';
import { appendSegment } from '@/schema-form/helpers/jsonPointer';
import {
  EMPTY_INTERSECTION,
  intersectEnum,
} from '@/schema-form/helpers/schemaIntersection';

import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';
import { foldAllowedTypes } from '../../../../utils/nodeIdentity/foldAllowedTypes';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintGate } from '../../../types/node';
import type { BlueprintSchema } from '../../../types/schema';
import { intersectAllowedTypes } from '../../../utils/allowedTypes/intersectAllowedTypes';
import { readAllowedTypes } from '../../../utils/allowedTypes/readAllowedTypes';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { inferAllowedTypes } from '../nodeTypes/inferAllowedTypes';
import { collectStaticSchemas } from '../references/collectStaticSchemas';

/** Union keywords whose branches are checked for a shared discriminator. */
const UNION_KEYWORDS: readonly ('oneOf' | 'anyOf')[] = ['oneOf', 'anyOf'];

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
): Map<
  string,
  Extract<BlueprintGate, { kind: 'discriminator' }>['condition']
> => {
  const host = readSchemaObject(schema);
  const propertyName = host.controls?.discriminator;
  const result = new Map<
    string,
    Extract<BlueprintGate, { kind: 'discriminator' }>['condition']
  >();
  if (propertyName === undefined) return result;
  if (!propertyName.length)
    return throwBlueprintError(
      FormErrorCode.InvalidControlShape,
      appendSegment(
        appendSegment(schemaPath, SCHEMA_GROUP.controls),
        'discriminator',
      ),
      {
        group: SCHEMA_GROUP.controls,
        key: 'discriminator',
        expected: RESERVED_SCHEMA_KEYS.controls.discriminator.shallow,
      },
      context.options,
    );
  const hostParts = collectStaticSchemas(context, schema, schemaPath);
  let hostTypes: ReturnType<typeof readAllowedTypes>;
  let hostTagTypes: ReturnType<typeof readAllowedTypes>;
  for (const part of hostParts) {
    hostTypes = intersectAllowedTypes(
      hostTypes,
      readAllowedTypes(part.schema, part.schemaPath, context.options),
    );
    const property = readSchemaObject(part.schema).properties?.[propertyName];
    if (property === undefined) continue;
    const propertyPath = appendSegment(
      appendSegment(part.schemaPath, 'properties'),
      propertyName,
    );
    for (const tag of collectStaticSchemas(context, property, propertyPath))
      hostTagTypes = intersectAllowedTypes(
        hostTagTypes,
        readAllowedTypes(tag.schema, tag.schemaPath, context.options),
      );
  }
  if (hostTypes !== undefined && foldAllowedTypes(hostTypes) !== 8)
    return result;
  if (!isArray(host.oneOf) && !isArray(host.anyOf)) return result;
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
      let tagTypes: ReturnType<typeof readAllowedTypes>;
      const tagProperties: { schema: BlueprintSchema; schemaPath: string }[] =
        [];
      for (const part of parts) {
        const property = readSchemaObject(part.schema).properties?.[
          propertyName
        ];
        if (property === undefined) continue;
        const propertyPath = appendSegment(
          appendSegment(part.schemaPath, 'properties'),
          propertyName,
        );
        tagProperties.push({ schema: property, schemaPath: propertyPath });
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
            values = intersection === EMPTY_INTERSECTION ? [] : intersection;
          }
        }
      }
      if (values === undefined) continue;
      for (const property of tagProperties) {
        if (values.length) {
          tagTypes = intersectAllowedTypes(
            tagTypes,
            inferAllowedTypes(
              context,
              property.schema,
              property.schemaPath,
              true,
            ),
          );
        } else {
          for (const tag of collectStaticSchemas(
            context,
            property.schema,
            property.schemaPath,
          ))
            tagTypes = intersectAllowedTypes(
              tagTypes,
              readAllowedTypes(tag.schema, tag.schemaPath, context.options),
            );
        }
      }
      const mask =
        tagTypes === undefined ? undefined : foldAllowedTypes(tagTypes);
      if (
        hostTagTypes === undefined &&
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
      if (keyword === 'oneOf' && hasOverlappingTag) {
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
        Object.freeze({
          propertyName,
          values: Object.freeze([...values]),
          ...(!values.length
            ? { lift: false }
            : hostTagTypes !== undefined &&
                ((mask !== undefined &&
                  (mask & foldAllowedTypes(hostTagTypes)) === BIT_MASK_NONE) ||
                  !values.some((value) =>
                    value === null
                      ? hostTagTypes.includes('null')
                      : hostTagTypes.some((type) =>
                          type === 'integer'
                            ? typeof value === 'number' &&
                              Number.isInteger(value)
                            : type === 'array'
                              ? isArray(value)
                              : type === 'object'
                                ? typeof value === 'object' && !isArray(value)
                                : typeof value === type,
                        ),
                  ))
              ? { lift: false, kindUnreachable: true }
              : {}),
        }),
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
