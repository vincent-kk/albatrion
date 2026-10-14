import type { Validator } from '../../type';

/**
 * Narrow a tree-selected runtime value to the core validator contract.
 * @param candidate - Value supplied at tree construction.
 * @returns Whether core can call both compilation operations.
 */
export const isValidator = (candidate: unknown): candidate is Validator =>
  candidate !== null && typeof candidate === 'object' &&
  'compile' in candidate && typeof candidate.compile === 'function' &&
  'compileGuard' in candidate && typeof candidate.compileGuard === 'function';
