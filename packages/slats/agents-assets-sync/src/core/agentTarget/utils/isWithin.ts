import { sep } from 'node:path';

/**
 * Decide whether a resolved location sits at or below a root.
 *
 * @param root - real, absolute root
 * @param candidate - real, absolute location; `null` (unresolvable) is never within
 * @returns `true` when `candidate` is `root` or a descendant of it
 */
export function isWithin(root: string, candidate: string | null): boolean {
  return (
    candidate !== null &&
    (candidate === root || candidate.startsWith(root + sep))
  );
}
