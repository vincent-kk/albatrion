import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Detect an unbounded repeated template after explicit input has run out.
 * @param parent - Current declaration host
 * @param template - Template requested by the gate
 * @param input - Explicit value for that occurrence, if any
 * @returns Whether the same template already has an absent-input ancestor
 */
export const hasRecursiveExpansion = <Self extends SchemaNodeRecord<Self>>(
  parent: Self,
  template: BlueprintNode,
  input: unknown,
): boolean => {
  if (input !== undefined) return false;
  let ancestor: Self | null = parent;
  while (ancestor) {
    if (ancestor.blueprintNode === template && ancestor.raw === undefined)
      return true;
    ancestor = ancestor.parent;
  }
  return false;
};
