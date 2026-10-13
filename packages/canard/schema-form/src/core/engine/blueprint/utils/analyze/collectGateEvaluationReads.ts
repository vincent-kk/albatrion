import { JSON_POINTER_PATH_REGEX } from '../expressions/regex';

/**
 * Preserve the host-independent part of every expression node read.
 * @param condition - Authored active expression or nonexpression condition
 * @returns Absolute paths and relative parent-climb counts in expression order
 */
export const collectGateEvaluationReads = (
  condition: unknown,
): readonly (string | number)[] => {
  if (typeof condition !== 'string') return Object.freeze([]);
  const reads: (string | number)[] = [];
  for (const match of condition.matchAll(JSON_POINTER_PATH_REGEX)) {
    const path = match[0];
    if (path === '@') continue;
    if (path === '#' || path === '/') reads.push('');
    else if (path.startsWith('#/')) reads.push(path.slice(1));
    else if (path.startsWith('/')) reads.push(path);
    else {
      let levels = 0;
      let relative = path;
      while (relative.startsWith('../')) {
        levels++;
        relative = relative.slice(3);
      }
      reads.push(levels);
    }
  }
  return Object.freeze(reads);
};
