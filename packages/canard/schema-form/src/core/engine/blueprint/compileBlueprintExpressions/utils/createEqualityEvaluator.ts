import type { EqualityLiteral } from '../../types/blueprint';

/**
 * Evaluate a proven OR of strict comparisons in authored literal order.
 * @param literals - Recognizer-owned primitive literals for dependency index zero
 * @returns Pure predicate with no dynamic compilation or retained runtime values
 */
export const createEqualityEvaluator =
  (literals: readonly EqualityLiteral[]) =>
  (dependencies: unknown[]): boolean => {
    for (let index = 0; index < literals.length; index++)
      if (dependencies[0] === literals[index]) return true;
    return false;
  };
