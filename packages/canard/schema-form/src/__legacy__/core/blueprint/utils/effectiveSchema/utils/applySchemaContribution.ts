import { isArray } from '@winglet/common-utils/filter';

import type {
  EffectiveSchemaOptions,
  PropertyDeclaration,
} from '../../../type';
import { applyConstraintKeywords } from './applyConstraintKeywords';
import { applyTypeContribution } from './applyTypeContribution';
import { mergeHintGroup } from './mergeHintGroup';
import type { EffectiveSchemaState } from './type';

/** Constraint names owned by keyword-specific intersection policies. */
const CONSTRAINT_KEYS = [
  'enum',
  'const',
  'multipleOf',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'minProperties',
  'maxProperties',
];

/**
 * Apply one contribution to fresh accumulation state, preserving raw declarations.
 * @param state - Private result state to mutate.
 * @param declaration - Active authored schema and its diagnostic location.
 * @param options - Error and renderer atomicity policies.
 * @returns Nothing; modifies only state and newly created group containers.
 */
export const applySchemaContribution = (
  state: EffectiveSchemaState,
  declaration: PropertyDeclaration,
  options: EffectiveSchemaOptions,
): void => {
  const schema = declaration.schema;
  if (typeof schema === 'boolean') return;
  applyTypeContribution(state, schema, declaration.schemaPath, options);
  for (const key of Object.keys(schema)) {
    const value = schema[key];
    if (
      value === undefined ||
      key === 'type' ||
      key === 'nullable' ||
      CONSTRAINT_KEYS.includes(key)
    )
      continue;
    if (key === 'options' || key === 'presentation')
      state.schema[key] = mergeHintGroup(
        state.schema[key],
        value,
        key === 'options',
        options.isAtomic,
      );
    else if (key === 'controls') {
      if (declaration.scope === 'node') applyControlHints(state.schema, value);
    } else if (key === 'readOnly')
      state.schema.readOnly = state.schema.readOnly === true || value === true;
    else if (key === 'required' && isArray(value)) {
      const earlier = isArray(state.schema.required)
        ? state.schema.required
        : [];
      state.schema.required = [
        ...earlier,
        ...value.filter(
          (entry, index) =>
            !earlier.includes(entry) && value.indexOf(entry) === index,
        ),
      ];
    } else if (key === 'pattern' && typeof value === 'string') {
      if (!state.patterns.includes(value)) state.patterns.push(value);
    } else if (key === 'allOf' && isArray(value))
      state.schema.allOf = [
        ...(isArray(state.schema.allOf) ? state.schema.allOf : []),
        ...value,
      ];
    else state.schema[key] = value;
  }
  applyConstraintKeywords(state, schema, declaration.schemaPath, options);
};

/**
 * Keep single-value hints while behavioral rules remain in raw declarations.
 * @param target - Fresh effective schema whose controls hint may be replaced.
 * @param source - Authored controls object; other values contribute no hint.
 * @returns Nothing; updates only a newly allocated controls hint object.
 */
function applyControlHints(
  target: Record<string, unknown>,
  source: unknown,
): void {
  if (!source || typeof source !== 'object') return;
  const previous = target.controls as Record<string, unknown> | undefined;
  const controls = { ...previous };
  for (const key of ['watch', 'default'])
    if ((source as Record<string, unknown>)[key] !== undefined)
      controls[key] = (source as Record<string, unknown>)[key];
  if (Object.keys(controls).length) target.controls = controls;
}
