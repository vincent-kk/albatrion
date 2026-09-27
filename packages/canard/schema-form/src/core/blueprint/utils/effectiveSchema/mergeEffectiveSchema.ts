import type {
  BlueprintNode,
  BlueprintSchema,
  EffectiveSchemaMemo,
  EffectiveSchemaOptions,
} from '../../type';
import { ensureEffectiveSchemaCache } from './utils/ensureEffectiveSchemaCache';
import { mergeSchemaContributions } from './utils/mergeSchemaContributions';
import { selectEffectiveDeclarations } from './utils/selectEffectiveDeclarations';

/** Default memo is weak by node lifetime; callers can isolate a separate memo. */
const DEFAULT_MEMO: EffectiveSchemaMemo = new WeakMap();

/**
 * Derive immutable rendering hints from selected declarations without evaluating gates.
 * @param node - Analyzed node retaining every raw declaration for later settlement.
 * @param activeDeclarationIds - IDs of active gated contributions; ungated ones always apply.
 * @param options - Static error policy and renderer atomic-value predicate.
 * @param memo - Optional caller-owned memo; omission uses the module's weak node cache.
 * @returns Shared hints for this active set; runtime conflicts remain schema data.
 * @throws Static intersection failures with their contributing authored location.
 */
export const mergeEffectiveSchema = (
  node: BlueprintNode,
  activeDeclarationIds: readonly number[],
  options: EffectiveSchemaOptions = {},
  memo: EffectiveSchemaMemo = DEFAULT_MEMO,
): BlueprintSchema => {
  const declarations = selectEffectiveDeclarations(node, activeDeclarationIds);
  const schemas = ensureEffectiveSchemaCache(memo, node, options);
  const key = declarations.map((declaration) => declaration.id).join(',');
  const cached = schemas.get(key);
  if (cached !== undefined) return cached;
  const schema = mergeSchemaContributions(node, declarations, options);
  schemas.set(key, schema);
  return schema;
};
