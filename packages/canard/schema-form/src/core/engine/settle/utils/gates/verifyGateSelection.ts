import { gateSelectionTable } from './gateSelectionTable';

/**
 * Assert an invariant and count failures only while the internal verify mode is on.
 * @param valid - Proven selection condition; no authored expression is executed here
 * @param message - Invariant-specific diagnostic for a failed assertion
 * @returns Nothing; throws on a verify-mode violation and increments its counter
 */
export const verifyGateSelection = (valid: boolean, message: string): void => {
  if (gateSelectionTable.mode !== 'verify' || valid) return;
  gateSelectionTable.violations++;
  throw new Error(message);
};
