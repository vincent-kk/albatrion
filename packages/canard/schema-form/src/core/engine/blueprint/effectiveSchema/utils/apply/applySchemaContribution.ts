import { isArray } from '@winglet/common-utils/filter';

import { SCHEMA_GROUP } from '../../../../constants/schemaGroup';
import { ownedSchemaValues } from '../../../../utils/cache/valueMemos';
import type { EffectiveSchemaOptions } from '../../../types/effectiveSchema';
import type { PropertyDeclaration } from '../../../types/node';
import type { EffectiveSchemaState } from '../../types/state';
import { mergeHintGroup } from '../merge/mergeHintGroup';
import { applyConstraintKeywords } from './applyConstraintKeywords';
import { applyControlHints } from './applyControlHints';
import { applyTypeContribution } from './applyTypeContribution';

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
      CONSTRAINT_KEYS.indexOf(key) !== -1
    )
      continue;
    if (key === SCHEMA_GROUP.options || key === SCHEMA_GROUP.presentation)
      state.schema[key] = mergeHintGroup(
        state.schema[key],
        value,
        key === SCHEMA_GROUP.options,
        options.isAtomic,
      );
    else if (key === SCHEMA_GROUP.controls) {
      if (declaration.scope === 'node') applyControlHints(state.schema, value);
    } else if (key === 'readOnly')
      state.schema.readOnly = state.schema.readOnly === true || value === true;
    else if (key === 'required' && isArray(value)) {
      const earlier = isArray(state.schema.required)
        ? state.schema.required
        : [];
      const required = [...earlier];
      for (let index = 0, length = value.length; index < length; index++) {
        const entry = value[index];
        if (earlier.indexOf(entry) === -1 && value.indexOf(entry) === index)
          required.push(entry);
      }
      state.schema.required = required;
      ownedSchemaValues.add(state.schema.required);
    } else if (key === 'pattern' && typeof value === 'string') {
      if (state.patterns.indexOf(value) === -1) state.patterns.push(value);
    } else if (key === 'allOf' && isArray(value)) {
      state.schema.allOf = [
        ...(isArray(state.schema.allOf) ? state.schema.allOf : []),
        ...value,
      ];
      ownedSchemaValues.add(state.schema.allOf);
    } else state.schema[key] = value;
  }
  applyConstraintKeywords(state, schema, declaration.schemaPath, options);
};
