import type { GateWheelFrame } from '../../types/gateWheel';
import { gateWheelEvaluation } from './gateWheelEvaluation';

/**
 * Check a predicted wheel's real no-op outcome and positional gate results.
 * @param expected - Preceding wheel whose predicate proved the confirmation redundant
 * @param actual - Actual confirmation frame, isolated from recursive child hosts
 * @param changed - Whether schema, children or output changed during confirmation
 * @returns Nothing; throws on any disproved prediction and records proof counts
 */

export const verifyGateWheelConfirmation = (
  expected: GateWheelFrame,
  actual: GateWheelFrame,
  changed: boolean,
): void => {
  const before = expected.evaluations!;
  const after = actual.evaluations!;
  let matchesEither = changed || before.length !== after.length;
  if (!matchesEither) {
    matchesEither = false;
    for (let index = 0, count = before.length; index < count; index++) {
      const entry = before[index];

      {
        const next = after[index];
        {
          if (
            entry.gate !== next.gate ||
            entry.path !== next.path ||
            entry.edgeName !== next.edgeName ||
            entry.value !== next.value
          ) {
            matchesEither = true;
            break;
          }
        }
      }
    }
  }
  if (matchesEither) {
    gateWheelEvaluation.nonNoop++;
    throw new Error('Gate wheel predicate predicted a non-no-op confirmation');
  }
  gateWheelEvaluation.confirmations++;
};
