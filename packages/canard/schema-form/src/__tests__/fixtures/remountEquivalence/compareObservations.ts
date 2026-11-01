import { collectDifferences } from './compareObservations/utils/collectDifferences';
import type { ObservationDifference, ObservationMask } from './types';

/**
 * Compare every public channel while enforcing the approved mask boundary.
 * @param updated - Updated tree observation.
 * @param fresh - Fresh mount observation of the updated output.
 * @param masks - Fixed channel paths and fresh predictions.
 * @param applied - Optional output counters checked against scene predictions.
 * @returns All differences outside the approved static masks.
 */
export function compareObservations(
  updated: unknown,
  fresh: unknown,
  masks: readonly ObservationMask[] = [],
  applied: Partial<Record<ObservationMask['category'], number>> = {},
): ObservationDifference[] {
  for (const mask of masks) {
    const parts = mask.path.split('/').slice(1);
    const channel = parts[0] === 'nodes' ? parts[2] : parts[0];
    if (
      ![
        'value',
        'raw',
        'outputValue',
        'output',
        'errors',
        'globalErrors',
      ].includes(channel) ||
      !mask.clause
    )
      throw new Error(`FORBIDDEN_MASK_CHANNEL ${mask.path}`);
  }
  const differences: ObservationDifference[] = [];
  collectDifferences(updated, fresh, '', masks, differences, applied);
  return differences;
}
