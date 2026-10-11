import type {
  BlueprintNode,
  EffectiveSchema,
  EffectiveSchemaMemo,
  EffectiveSchemaOptions,
} from '../../type';
import { DEFAULT_NO_ACTIVE } from './utils/constant';
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
 * @returns Shared result record for this active set; runtime const/enum conflicts remain schema
 * data and a type conflict is exposed as `typeConflict`.
 * @throws Static intersection failures with their contributing authored location.
 */
export const mergeEffectiveSchema = (
  node: BlueprintNode,
  activeDeclarationIds: readonly number[],
  options: EffectiveSchemaOptions = {},
  memo: EffectiveSchemaMemo = DEFAULT_MEMO,
): EffectiveSchema => {
  const defaultNoActive = activeDeclarationIds.length === 0 &&
    (options.mode === undefined || options.mode === 'runtime') &&
    options.isAtomic === undefined && options.collect === undefined &&
    memo === DEFAULT_MEMO;
  if (defaultNoActive) {
    const cached = DEFAULT_NO_ACTIVE.get(node);
    if (cached !== undefined) return cached;
  }
  const declarations = selectEffectiveDeclarations(node, activeDeclarationIds);
  const schemas = ensureEffectiveSchemaCache(memo, node, options);
  const key = declarations.map((declaration) => declaration.id).join(',');
  const cached = schemas.get(key);
  if (cached !== undefined) return cached;
  if (memo === DEFAULT_MEMO && options.collect === undefined &&
    options.isAtomic === undefined && (options.mode === undefined || options.mode === 'runtime') &&
    node.declarations.length === 1 && node.declarations[0].gates.length === 0) {
    const normalized = DEFAULT_NO_ACTIVE.get(node);
    if (normalized !== undefined) {
      schemas.set(key, normalized);
      return normalized;
    }
  }
  const effective = mergeSchemaContributions(node, declarations, options);
  schemas.set(key, effective);
  if (defaultNoActive) DEFAULT_NO_ACTIVE.set(node, effective);
  return effective;
};
