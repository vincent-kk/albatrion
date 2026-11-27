import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { readWriteCoverage } from '../write/readWriteCoverage';

/**
 * Decide whether a distributed child input at this path counts as a caller write.
 * A batch composes its root input from the last committed value, so untouched keys
 * are present too; only a path inside a replace path, or an ancestor of one that the
 * distribution must pass through, was written (R1). Outside a batch every key counts.
 * @param context - Settlement whose `writeOrigins` is set only for a multi-write batch
 * @param path - Child path the host would distribute to
 * @returns Whether the host's distributed input is a write for that child
 */
export const isWithinReplacementPaths = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): boolean => {
  const ranges = context.writeOrigins;
  return (
    !ranges || readWriteCoverage(ranges, path, 'distribution') !== undefined
  );
};
