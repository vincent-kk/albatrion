import type {
  BlueprintNode,
  EffectiveSchema,
  EffectiveSchemaMemo,
  EffectiveSchemaOptions,
} from '../../../type';

/**
 * Create a memo partition when its error or renderer policy is first encountered.
 * @param memo - Weak node map owned by the caller or merger module.
 * @param node - Identity whose authored declarations remain immutable.
 * @param options - Static/runtime mode and atomic predicate identity.
 * @returns The partition's mutable result map; inserts a partition when absent.
 */
export const ensureEffectiveSchemaCache = (
  memo: EffectiveSchemaMemo,
  node: BlueprintNode,
  options: EffectiveSchemaOptions,
): Map<string, EffectiveSchema> => {
  const mode = options.mode ?? 'runtime';
  const entries = memo.get(node) ?? [];
  const found = entries.find(
    (entry) => entry.mode === mode && entry.isAtomic === options.isAtomic,
  );
  if (found) return found.schemas;
  const schemas = new Map<string, EffectiveSchema>();
  entries.push({ mode, isAtomic: options.isAtomic, schemas });
  memo.set(node, entries);
  return schemas;
};
