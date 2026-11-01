import type { ClosingBound } from '../../stageClosingTypes';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** A ratio-only clause fails only above both limits; absent needed evidence stays unknown. */
export function decideRatioFloor(
  bound: ClosingBound | undefined,
  floor: number,
): boolean | null {
  if (!bound || bound.upperBound === null) return null;
  if (bound.upperBound !== '+Infinity' && bound.upperBound <= rules.ratioLimit)
    return true;
  if (bound.differenceUpperBound === null) return null;
  return bound.differenceUpperBound <= floor;
}
