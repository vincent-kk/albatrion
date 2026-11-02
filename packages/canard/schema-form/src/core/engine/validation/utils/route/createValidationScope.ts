import type { FieldNodeRecord } from '../../../record';

/**
 * Index requested identities and strict ancestor paths for one routing pass.
 * @param targets - Same-runtime occurrences, including recorded detached scopes
 * @returns Membership predicate that excludes a different node at an equal path
 */
export const createValidationScope = <Self extends FieldNodeRecord<Self>>(
  targets: readonly Self[],
): ((node: Self) => boolean) => {
  const identities = new Set(targets);
  const targetPaths = new Set(targets.map((target) => target.path));
  return (node) => {
    if (identities.has(node)) return true;
    let boundary = node.path.lastIndexOf('/');
    while (boundary >= 0) {
      if (targetPaths.has(node.path.slice(0, boundary))) return true;
      boundary = boundary === 0 ? -1 : node.path.lastIndexOf('/', boundary - 1);
    }
    return false;
  };
};
