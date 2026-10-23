import { isArray } from '@winglet/common-utils/filter';

import { FormErrorCode } from '../../../../../../errors';
import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';
import type {
  ChildSchemaControls,
  SchemaControls,
} from '../../../../types/controls';
import type { AnalysisContext } from '../../../types/analysis';
import type { BlueprintSchema } from '../../../types/schema';
import { readSchemaObject } from '../../../utils/analyze/readSchemaObject';
import { throwBlueprintError } from '../../../utils/diagnostics/throwBlueprintError';

/** Extension groups validated at every authored position. */
const CONTROL_GROUPS = [SCHEMA_GROUP.controls, SCHEMA_GROUP.options] as const;

/**
 * Validate closed extension namespaces at an authored schema position.
 * @param context - Error collector and authored root
 * @param schema - Schema whose controls/options belong to this position
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
  for (const group of CONTROL_GROUPS) {
    const value = record[group];
    if (value === undefined) continue;
    const allowed =
      group === SCHEMA_GROUP.options
        ? OPTION_KEYS
        : fragment
          ? CHILD_CONTROL_KEYS
          : CONTROL_KEYS;
    if (!value || typeof value !== 'object' || isArray(value))
      throwBlueprintError(
        FormErrorCode.InvalidControlShape,
        schemaPath + '/' + group,
        { group, key: group, expected: 'object' },
        context.options,
      );
    for (const key of Object.keys(value))
      if (!allowed.includes(key))
        throwBlueprintError(
          FormErrorCode.UnknownGroupKey,
          schemaPath + '/' + group + '/' + key,
          { group, key },
          context.options,
        );
  }
  const controls = record.controls;
  if (
    controls?.injectTo !== undefined &&
    typeof controls.injectTo !== 'function'
  )
    throwBlueprintError(
      FormErrorCode.InvalidControlShape,
      schemaPath + '/controls/injectTo',
      { group: SCHEMA_GROUP.controls, key: 'injectTo', expected: 'function' },
      context.options,
    );
  if (controls?.fields !== undefined) {
    if (!isArray(controls.fields))
      throwBlueprintError(
        FormErrorCode.InvalidControlShape,
        schemaPath + '/controls/fields',
        { group: SCHEMA_GROUP.controls, key: 'fields', expected: 'array' },
        context.options,
      );
    controls.fields.forEach((entry: any, index: number) => {
      const path = schemaPath + '/controls/fields/' + index;
      if (
        !entry ||
        typeof entry !== 'object' ||
        Object.keys(entry).some(
          (key) => key !== 'targets' && key !== 'controls',
        ) ||
        !isArray(entry.targets) ||
        entry.targets.some((name: unknown) => typeof name !== 'string')
      )
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
      validateControlGroups(context, { controls: entry.controls }, path, true);
    });
  }
};

/** Direct-child and fragment scope controls; `satisfies` ties the set to the authoring type in both directions. */
const CHILD_CONTROL_KEY_SET = {
  active: true,
  visible: true,
  readOnly: true,
  disabled: true,
  default: true,
  derived: true,
  unsetValue: true,
  resetInteraction: true,
  unsetOnInactive: true,
} satisfies Record<keyof ChildSchemaControls, true>;
/** Node-owned controls add declarations and cross-node injection. */
const CONTROL_KEY_SET = {
  ...CHILD_CONTROL_KEY_SET,
  fields: true,
  injectTo: true,
  discriminator: true,
  watch: true,
} satisfies Record<keyof SchemaControls<unknown>, true>;
const CHILD_CONTROL_KEYS: readonly string[] = Object.keys(
  CHILD_CONTROL_KEY_SET,
);
const CONTROL_KEYS: readonly string[] = Object.keys(CONTROL_KEY_SET);
/** Static shape and projection settings consumed by the corresponding owners. */
const OPTION_KEYS = [
  'terminal',
  'virtual',
  'propertyOrder',
  'omitEmpty',
  'omitTrailing',
  'trim',
];
