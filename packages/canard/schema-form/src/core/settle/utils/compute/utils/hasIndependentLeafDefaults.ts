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
  let independent = blueprint.expressions.length === 0;
  for (let index = 0; independent && index < blueprint.nodes.length; index++) {
    const node = blueprint.nodes[index];
    if (node.kind !== 'object' && node.kind !== 'string' && node.kind !== 'number' &&
      node.kind !== 'boolean' && node.kind !== 'null' ||
      node.kind === 'object' && node.strategy !== 'branch') {
      independent = false;
      break;
    }
    for (let declarationIndex = 0; declarationIndex < node.declarations.length; declarationIndex++) {
      const declaration = node.declarations[declarationIndex];
      if (declaration.gates.length) { independent = false; break; }
      const schema = declaration.schema;
      if (!schema || typeof schema !== 'object') continue;
      if (schema.controls !== undefined) { independent = false; break; }
      const value = schema.default;
      if (value === undefined) continue;
      if (node.kind === 'object' || value !== null &&
        typeof value !== 'string' && typeof value !== 'number' &&
        typeof value !== 'boolean') { independent = false; break; }
      hasDefault = true;
    }
  }
  independent = independent && hasDefault;
  INDEPENDENT.set(blueprint, independent);
  return independent;
};
