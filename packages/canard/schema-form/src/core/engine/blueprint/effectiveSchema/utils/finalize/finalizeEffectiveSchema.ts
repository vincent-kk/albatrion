import { isArray } from '@winglet/common-utils/filter';

import { ownedSchemaValues } from '../../../../utils/cache/valueMemos';
import type { EffectiveSchema } from '../../../types/effectiveSchema';
import type { BlueprintNode } from '../../../types/node';
import type { EffectiveSchemaState } from '../../types/state';
import { freezeEffectiveSchema } from './freezeEffectiveSchema';

/**
 * Serialize accumulated hints without emitting an invalid empty type array.
 * @param state - Completed private accumulation state.
 * @param node - Static kind and shared schemaType identity.
 * @returns A public frozen schema in a development-protected envelope; static type identity survives when not narrowed or in conflict, and static nullable stays on conflict, and an
 * empty type intersection is reported by `typeConflict` instead of an enum. A virtual node's schema carries the internal type `virtual`.
 */
export const finalizeEffectiveSchema = (
  state: EffectiveSchemaState,
  node: BlueprintNode,
): EffectiveSchema => {
  const schema = state.schema;
  if (state.patterns.length) {
    schema.pattern = state.patterns[0];
    if (state.patterns.length > 1) {
      const clauses = [...(isArray(schema.allOf) ? schema.allOf : [])];
      for (let index = 1; index < state.patterns.length; index++) {
        const clause = { pattern: state.patterns[index] };
        ownedSchemaValues.add(clause);
        clauses.push(clause);
      }
      schema.allOf = clauses;
      ownedSchemaValues.add(clauses);
    }
  }
  const types = (() => {
    const items = state.allowedTypes;
    if (items == null) return undefined;
    const result: Array<(typeof items)[number]> = [];
    iterate: for (let index = 0, count = items.length; index < count; index++) {
      if (!(index in items)) continue;
      const item = items[index];
      const type = item;
      {
        if (type !== 'null') result.push(item);
        continue iterate;
      }
    }
    return result;
  })();
  const staticTypes = isArray(node.schemaType)
    ? node.schemaType
    : [node.schemaType];
  const unchanged =
    types?.length === staticTypes.length &&
    (() => {
      const items = types;
      for (
        let position = 0, count = items.length;
        position < count;
        position++
      ) {
        if (!(position in items)) continue;
        const type = items[position];
        const index = position;
        if (!(type === staticTypes[index])) return false;
      }
      return true;
    })();
  schema.type =
    node.kind === 'virtual'
      ? 'virtual'
      : state.conflictingType || unchanged
        ? node.schemaType
        : types?.length === 0
          ? 'null'
          : types;
  if (schema.type === types && types !== undefined)
    ownedSchemaValues.add(types);
  if (state.conflictingType) {
    if (node.nullable) schema.nullable = true;
  } else if (node.nullable || state.allowedTypes?.includes('null'))
    schema.nullable = state.allowedTypes?.includes('null') ?? node.nullable;
  if (state.conflictingConst) {
    schema.enum = [];
    ownedSchemaValues.add(schema.enum);
  }
  return freezeEffectiveSchema({
    schema,
    typeConflict: state.conflictingType,
  });
};
