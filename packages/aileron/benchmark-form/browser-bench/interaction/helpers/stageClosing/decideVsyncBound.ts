import type { ClosingBound } from '../../stageClosingTypes';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';

/** A vsync metric fails only when both registered one-sided bounds exceed their limits. */
export function decideVsyncBound(
  bound: ClosingBound | undefined,
  differenceLimit = rules.vsyncDifferenceMs,
): boolean | null {
  if (
    !bound ||
    bound.upperBound === null ||
    bound.differenceUpperBound === null
  )
    return null;
  return !(
    (bound.upperBound === '+Infinity' || bound.upperBound > rules.ratioLimit) &&
    bound.differenceUpperBound > differenceLimit
  );
}
