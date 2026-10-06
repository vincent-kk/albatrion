import { isArray } from '@winglet/common-utils/filter';

import type {
  EffectiveSchemaOptions,
  PropertyDeclaration,
} from '../../../type';
import { OwnedSchemaValues } from './OwnedSchemaValues';
import { applyConstraintKeywords } from './applyConstraintKeywords';
import { applyControlHints } from './applySchemaContribution/utils/applyControlHints';
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
      OwnedSchemaValues.add(state.schema.required as object);
    } else if (key === 'pattern' && typeof value === 'string') {
      if (!state.patterns.includes(value)) state.patterns.push(value);
    } else if (key === 'allOf' && isArray(value)) {
      state.schema.allOf = [
        ...(isArray(state.schema.allOf) ? state.schema.allOf : []),
        ...value,
      ];
      OwnedSchemaValues.add(state.schema.allOf as object);
    } else state.schema[key] = value;
  }
  applyConstraintKeywords(state, schema, declaration.schemaPath, options);
};
