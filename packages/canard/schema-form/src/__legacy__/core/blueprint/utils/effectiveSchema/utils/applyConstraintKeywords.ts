import { isArray } from '@winglet/common-utils/filter';

import {
  EMPTY_INTERSECTION,
  intersectConst,
  intersectEnum,
  intersectMaximum,
  intersectMinimum,
  intersectMultipleOf,
  validateRange,
} from '@/schema-form/__legacy__/helpers/schemaIntersection';

import type { EffectiveSchemaOptions } from '../../../type';
import { BlueprintErrorCode } from '../../diagnostics/constant';
import { throwBlueprintError } from '../../diagnostics/throwBlueprintError';
import type { EffectiveSchemaState } from './type';

/** Paired monotone bounds; each pair is checked independently, never across keywords. */
const RANGES = [
  ['minimum', 'maximum'],
  ['exclusiveMinimum', 'exclusiveMaximum'],
  ['minLength', 'maxLength'],
  ['minItems', 'maxItems'],
  ['minProperties', 'maxProperties'],
] as const;

/**
 * Intersect supported keyword families and translate leaf empty markers by mode.
 * @param state - Fresh effective schema state, never an authored schema.
 * @param source - Current contribution's keyword values.
 * @param schemaPath - Current authored location for static failures.
 * @param options - Runtime leaves invalid constraints for the validator; static throws only
 * when this contribution crosses an earlier one on the same keyword.
 * @returns Nothing; updates keyword constraints and sticky const conflict state.
 */
export const applyConstraintKeywords = (
  state: EffectiveSchemaState,
  source: Readonly<Record<string, unknown>>,
  schemaPath: string,
  options: EffectiveSchemaOptions,
): void => {
  const target = state.schema;
  for (const [bound, exclusive] of [
    ['minimum', 'exclusiveMinimum'],
    ['maximum', 'exclusiveMaximum'],
  ] as const) {
    if (typeof source[exclusive] !== 'boolean') continue;
    const clause = {
      [exclusive]: source[exclusive],
      ...(source[bound] === undefined ? {} : { [bound]: source[bound] }),
    };
    target.allOf = [
      ...(isArray(target.allOf) ? target.allOf : []),
      clause,
    ];
  }
  for (const [lower, upper] of RANGES) {
    const crossing =
      (numberValue(source[lower]) !== undefined ||
        numberValue(source[upper]) !== undefined) &&
      (target[lower] !== undefined || target[upper] !== undefined);
    const minimum = intersectMinimum(
      numberValue(target[lower]),
      numberValue(source[lower]),
    );
    const maximum = intersectMaximum(
      numberValue(target[upper]),
      numberValue(source[upper]),
    );
    if (minimum !== undefined) target[lower] = minimum;
    if (maximum !== undefined) target[upper] = maximum;
    if (
      options.mode === 'static' &&
      crossing &&
      validateRange(minimum, maximum) === EMPTY_INTERSECTION
    )
      throwBlueprintError(
        BlueprintErrorCode.InvalidRange,
        schemaPath,
        { lower, upper, minimum, maximum },
        options,
      );
  }
  const multipleOf = intersectMultipleOf(
    numberValue(target.multipleOf),
    numberValue(source.multipleOf),
  );
  if (multipleOf !== undefined) target.multipleOf = multipleOf;
  const enumeration = intersectEnum(
    isArray(target.enum) ? target.enum : undefined,
    isArray(source.enum) ? source.enum : undefined,
    true,
  );
  if (enumeration === EMPTY_INTERSECTION) {
    if (options.mode === 'static')
      throwBlueprintError(
        BlueprintErrorCode.EmptyEnumIntersection,
        schemaPath,
        {},
        options,
      );
    target.enum = [];
  } else if (enumeration !== undefined) target.enum = enumeration;
  const constant = intersectConst(target.const, source.const);
  if (constant === EMPTY_INTERSECTION) {
    if (options.mode === 'static')
      throwBlueprintError(
        BlueprintErrorCode.ConflictingConstValues,
        schemaPath,
        {},
        options,
      );
    state.conflictingConst = true;
  } else if (constant !== undefined && !state.conflictingConst)
    target.const = constant;
  if (state.conflictingConst) {
    delete target.const;
    target.enum = [];
  }
};

/**
 * Select numeric bounds for arithmetic intersection.
 * @param value - An authored keyword value whose type has not been narrowed.
 * @returns The numeric value, or undefined for a nonnumeric keyword form.
 */
function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
