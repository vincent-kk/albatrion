import type { Blueprint } from '../../../blueprint';
import { getTransitionBudgetCap } from '../gates/getGateBudgetCap';

/**
 * Read the cached authored-decision count for the transition round ceiling.
 * @param blueprint - Immutable analyzed schema shared by the tree
 * @returns Gated fragments plus node gates plus the final settling round
 */
export const getTransitionCap = (blueprint: Blueprint): number => {
  return getTransitionBudgetCap(blueprint);
};
