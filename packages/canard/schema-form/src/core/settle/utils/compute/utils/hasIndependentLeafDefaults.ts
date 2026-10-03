import type { Blueprint } from '../../../../blueprint';

/** Proof results share the lifetime of their immutable analyzed graph. */
const INDEPENDENT = new WeakMap<Blueprint, boolean>();

/**
 * Prove that filling cannot alter shape or observe an intermediate projection.
 * @param blueprint - Analyzed graph with all declarations and expressions
 * @returns Whether only static object branches and scalar leaf defaults occur
 */
export const hasIndependentLeafDefaults = (blueprint: Blueprint): boolean => {
  const cached = INDEPENDENT.get(blueprint);
  if (cached !== undefined) return cached;
  let hasDefault = false;
  const independent = blueprint.expressions.length === 0 && blueprint.nodes.every((node) => {
    if (node.kind !== 'object' && node.kind !== 'string' && node.kind !== 'number' &&
      node.kind !== 'boolean' && node.kind !== 'null') return false;
    if (node.kind === 'object' && node.strategy !== 'branch') return false;
    return node.declarations.every((declaration) => {
      if (declaration.gates.length) return false;
      const schema = declaration.schema;
      if (!schema || typeof schema !== 'object') return true;
      if (schema.controls !== undefined) return false;
      const value = schema.default;
      if (value === undefined) return true;
      if (node.kind === 'object' || value !== null &&
        typeof value !== 'string' && typeof value !== 'number' &&
        typeof value !== 'boolean') return false;
      hasDefault = true;
      return true;
    });
  }) && hasDefault;
  INDEPENDENT.set(blueprint, independent);
  return independent;
};
