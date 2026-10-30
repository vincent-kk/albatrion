import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import type {
  EffectiveSchema,
  EffectiveSchemaMemo,
  EffectiveSchemaOptions,
} from '../../../types/effectiveSchema';
import type { BlueprintNode } from '../../../types/node';
import { ensureEffectiveSchemaCache } from '../finalize/ensureEffectiveSchemaCache';
import { mergeSchemaContributions } from './mergeSchemaContributions';
import { selectEffectiveDeclarations } from './selectEffectiveDeclarations';

/** Shared options for a merge with the runtime policy and no predicate or collector. */
const DEFAULT_MERGE_OPTIONS: EffectiveSchemaOptions = {};

/** Default memo is weak by node lifetime; callers can isolate a separate memo. */

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
  options: EffectiveSchemaOptions = DEFAULT_MERGE_OPTIONS,
  memo?: EffectiveSchemaMemo,
): EffectiveSchema => {
  const defaultNoActive =
    activeDeclarationIds.length === 0 &&
    (options.mode === undefined || options.mode === 'runtime') &&
    options.isAtomic === undefined &&
    options.collect === undefined &&
    memo === undefined;
  if (defaultNoActive) {
    const cached = getHostDerived<'defaultEffectiveSchema', EffectiveSchema>(
      node,
    ).defaultEffectiveSchema;
    if (cached !== undefined) return cached;
  }
  const declarations = selectEffectiveDeclarations(node, activeDeclarationIds);
  const schemas = ensureEffectiveSchemaCache(memo, node, options);
  const key = declarations.map((declaration) => declaration.id).join(',');
  const cached = schemas.get(key);
  if (cached !== undefined) return cached;
  if (
    memo === undefined &&
    options.collect === undefined &&
    options.isAtomic === undefined &&
    (options.mode === undefined || options.mode === 'runtime') &&
    node.declarations.length === 1 &&
    node.declarations[0].gates.length === 0
  ) {
    const normalized = getHostDerived<
      'defaultEffectiveSchema',
      EffectiveSchema
    >(node).defaultEffectiveSchema;
    if (normalized !== undefined) {
      schemas.set(key, normalized);
      return normalized;
    }
  }
  const effective = mergeSchemaContributions(node, declarations, options);
  schemas.set(key, effective);
  if (defaultNoActive)
    getHostDerived<'defaultEffectiveSchema', EffectiveSchema>(
      node,
    ).defaultEffectiveSchema = effective;
  return effective;
};
