import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import {
  CHILD_CONTROL_KEYS,
  RESERVED_CONTROL_KEYS,
} from '@/schema-form/constants/reservedSchemaKeys';
import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { FormErrorCode } from '../../../../../../errors';
import { CONTROL_KEY } from '../../../../constants/controlKey';
import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';
import { validateControlValue } from './validateControlValue';

/**
 * Validate the closed executable controls namespace at an authored position.
 * @param context - Error collector and authored root
 * @param schema - Schema whose controls belong to this position
 * @param schemaPath - Original diagnostic location
 * @param fragment - Whether controls are scoped to a fragment's direct children
 * @returns Nothing; malformed extension declarations throw a schema error
 */
export const validateControlGroups = (
  context: AnalysisContext,
  schema: BlueprintSchema,
  schemaPath: string,
  fragment: boolean,
): void => {
  const record = readSchemaObject(schema);
  const controls = record.controls;
  if (controls !== undefined) {
    const group = SCHEMA_GROUP.controls;
    const allowed: readonly (typeof RESERVED_CONTROL_KEYS)[number][] = fragment
      ? CHILD_CONTROL_KEYS
      : RESERVED_CONTROL_KEYS;
    if (!controls || typeof controls !== 'object' || isArray(controls))
      throwBlueprintError(
        FormErrorCode.InvalidControlShape,
        appendSegment(schemaPath, group),
        { group, key: group, expected: 'object' },
        context.options,
      );
    for (const key of Object.keys(controls)) {
      let isAllowed = false;
      for (let index = 0; index < allowed.length; index++)
        if (allowed[index] === key) {
          isAllowed = true;
          break;
        }
      if (!isAllowed)
        throwBlueprintError(
          FormErrorCode.UnknownGroupKey,
          appendSegment(appendSegment(schemaPath, group), key),
          { group, key },
          context.options,
        );
    }
    for (const key of RESERVED_CONTROL_KEYS)
      validateControlValue(context, key, controls[key], schemaPath);
  }
  if (controls && hasOwnProperty(controls, CONTROL_KEY.inactiveValue))
    context.hasInactiveValues = true;
  if (controls?.fields !== undefined) {
    const controlFields = controls.fields;
    for (let index = 0, limit = controlFields.length; index < limit; index++) {
      if (!(index in controlFields)) continue;
      const entry: any = controlFields[index];

      const path = appendSegment(
        appendSegment(
          appendSegment(schemaPath, SCHEMA_GROUP.controls),
          'fields',
        ),
        index,
      );
      let hasInvalidFieldEntry = !entry || typeof entry !== 'object';
      if (!hasInvalidFieldEntry) {
        const entryKeys = Object.keys(entry);
        for (let index = 0, count = entryKeys.length; index < count; index++) {
          const key = entryKeys[index];

          if (key !== 'targets' && key !== SCHEMA_GROUP.controls) {
            hasInvalidFieldEntry = true;
            break;
          }
        }
      }
      let hasInvalidFieldTargets =
        hasInvalidFieldEntry || !isArray(entry.targets);
      if (!hasInvalidFieldTargets) {
        const fieldTargets = entry.targets;
        for (
          let index = 0, count = fieldTargets.length;
          index < count;
          index++
        ) {
          if (!(index in fieldTargets)) {
            continue;
          }

          const name: unknown = fieldTargets[index];

          if (typeof name !== 'string') {
            hasInvalidFieldTargets = true;
            break;
          }
        }
      }
      if (hasInvalidFieldTargets) {
        throwBlueprintError(
          FormErrorCode.InvalidControlShape,
          path,
          {
            group: SCHEMA_GROUP.controls,
            key: 'fields',
            expected: '{ targets: string[], controls? }',
          },
          context.options,
        );
      }
      validateControlGroups(context, { controls: entry.controls }, path, true);
    }
  }
};
