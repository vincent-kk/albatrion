import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintChildEntry, PropertyDeclaration } from '../../../blueprint';

/**
 * Detect active gated declarations of different folds without a static owner.
 * @param entry - Child edge whose declarations share one public name
 * @param active - Contributions selected by the current host wheel
 * @returns Whether more than one gated kind claims an unowned name
 */
export const hasSharedConflict = (
  entry: BlueprintChildEntry,
  active: readonly PropertyDeclaration[],
): boolean => {
  if (active.some((declaration) =>
    declaration.role === 'declaration' && declaration.gates.length === 0))
    return false;
  const kinds = active.filter((declaration) =>
    declaration.role === 'declaration' && declaration.gates.length > 0)
    .map((declaration) => {
      const schema = declaration.schema;
      const type = typeof schema === 'object' && schema !== null ? schema.type : undefined;
      const first = isArray(type) ? type[0] : type;
      return first === 'integer' ? 'number' : first ?? entry.node.kind;
    });
  return kinds.length > 1 && kinds.some((kind) => kind !== kinds[0]);
};
