/**
 * Test the enabled flag with the single-input synchronous guard contract.
 * @param gateInput - Projected host input passed to an `if` predicate
 * @returns Whether the test host explicitly enables its guarded branch
 */
export const ifPredicate = (gateInput: unknown): boolean =>
  gateInput !== null &&
  typeof gateInput === 'object' &&
  'enabled' in gateInput &&
  gateInput.enabled === true;

/**
 * Exercise guard failure with the same single-input synchronous contract.
 * @param _gateInput - Projected host input, deliberately unused after entry
 * @returns No value because guard evaluation always fails
 * @throws The deliberate guard error used by settlement tests
 */
export const throwingIfPredicate = (_gateInput: unknown): boolean => {
  throw new Error('guard evaluation failed');
};
