import type { BlueprintSchema } from '../../type';
import { readSchemaObject } from '../analyze/readSchemaObject';
import type { AnalysisContext } from '../analyze/type';
import { BlueprintErrorCode } from './constant';
import { throwBlueprintError } from './throwBlueprintError';

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
  for (const group of ['controls', 'options'] as const) {
    const value = record[group];
    if (value === undefined) continue;
    const allowed =
      group === 'options'
        ? OPTION_KEYS
        : fragment
          ? CHILD_CONTROL_KEYS
          : CONTROL_KEYS;
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throwBlueprintError(
        BlueprintErrorCode.InvalidControlShape,
        `${schemaPath}/${group}`,
        { group, key: group, expected: 'object' },
        context.options,
      );
    for (const key of Object.keys(value))
      if (!allowed.includes(key))
        throwBlueprintError(
          BlueprintErrorCode.UnknownGroupKey,
          `${schemaPath}/${group}/${key}`,
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
      BlueprintErrorCode.InvalidControlShape,
      `${schemaPath}/controls/injectTo`,
      { group: 'controls', key: 'injectTo', expected: 'function' },
      context.options,
    );
  if (controls?.children !== undefined) {
    if (!Array.isArray(controls.children))
      throwBlueprintError(
        BlueprintErrorCode.InvalidControlShape,
        `${schemaPath}/controls/children`,
        { group: 'controls', key: 'children', expected: 'array' },
        context.options,
      );
    controls.children.forEach((entry: any, index: number) => {
      const path = `${schemaPath}/controls/children/${index}`;
      if (
        !entry ||
        typeof entry !== 'object' ||
        Object.keys(entry).some(
          (key) => key !== 'targets' && key !== 'controls',
        ) ||
        !Array.isArray(entry.targets) ||
        entry.targets.some((name: unknown) => typeof name !== 'string')
      )
        throwBlueprintError(
          BlueprintErrorCode.InvalidControlShape,
          path,
          {
            group: 'controls',
            key: 'children',
            expected: '{ targets: string[], controls? }',
          },
          context.options,
        );
      validateControlGroups(context, { controls: entry.controls }, path, true);
    });
  }
};

/** Direct-child and fragment scope controls share the closed ledger vocabulary. */
const CHILD_CONTROL_KEYS = [
  'active',
  'visible',
  'readOnly',
  'disabled',
  'default',
  'derived',
  'unsetValue',
  'resetInteraction',
  'unsetOnInactive',
];
/** Node-owned controls add declarations and cross-node injection. */
const CONTROL_KEYS = [
  ...CHILD_CONTROL_KEYS,
  'children',
  'injectTo',
  'discriminator',
  'watch',
];
/** Static shape and projection settings consumed by the corresponding owners. */
const OPTION_KEYS = [
  'terminal',
  'virtual',
  'propertyKeys',
  'omitEmpty',
  'omitTrailing',
  'trim',
];
