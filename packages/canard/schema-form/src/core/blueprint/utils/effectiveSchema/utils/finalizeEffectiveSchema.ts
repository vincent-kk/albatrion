import type { BlueprintNode, BlueprintSchema } from '../../../type';
import type { EffectiveSchemaState } from './type';

/**
 * Serialize accumulated hints without emitting an invalid empty type array.
 * @param state - Completed private accumulation state.
 * @param node - Static kind and shared schemaType identity.
 * @returns A frozen outer schema; static type identity survives when not narrowed.
 */
export const finalizeEffectiveSchema = (
  state: EffectiveSchemaState,
  node: BlueprintNode,
): BlueprintSchema => {
  const schema = state.schema;
  if (state.patterns.length) {
    schema.pattern = state.patterns[0];
    if (state.patterns.length > 1)
      schema.allOf = [
        ...(Array.isArray(schema.allOf) ? schema.allOf : []),
        ...state.patterns.slice(1).map((pattern) => ({ pattern })),
      ];
  }
  const types = state.allowedTypes?.filter((type) => type !== 'null');
  const staticTypes = Array.isArray(node.schemaType)
    ? node.schemaType
    : [node.schemaType];
  const unchanged =
    types?.length === staticTypes.length &&
    types.every((type, index) => type === staticTypes[index]);
  schema.type =
    state.conflictingType || unchanged || node.kind === 'virtual'
      ? node.schemaType
      : types?.length === 0
        ? 'null'
        : Object.freeze(types);
  if (node.nullable || state.allowedTypes?.includes('null'))
    schema.nullable = state.allowedTypes?.includes('null') ?? node.nullable;
  if (state.conflictingType || state.conflictingConst) schema.enum = [];
  return Object.freeze(schema);
};
