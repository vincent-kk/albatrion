import type { FieldNodeRecord } from '../../../../record';
import type { DeriveTraceEntry, DeriveWrite } from '../../../types/decisions';
import type { DeriveState } from '../../../types/state';
import { compareDeriveWrites } from '../rank/compareDeriveWrites';

/**
 * Keep one winner per path while recording every consumed candidate.
 * @param candidate - Fired rule's addressed write
 * @param sourcePath - Current source occurrence for the trace
 * @param state - Settlement-wide suppression and applied kind ranks
 * @param winners - Current round's addressed winners
 * @param trace - Mutable development-only round account
 * @param traceWinners - Trace index of each current winner
 * @returns Nothing; both outputs are updated in place
 */
export const chooseDeriveWrite = <Self extends FieldNodeRecord<Self>>(
  candidate: DeriveWrite<Self>,
  sourcePath: string,
  state: DeriveState<Self>,
  winners: Map<string, DeriveWrite<Self>>,
  trace: DeriveTraceEntry[],
  traceWinners: Map<string, number>,
): void => {
  const path = candidate.targetPath;
  const prior = winners.get(path);
  const wins =
    !state.isAutomaticWriteSuppressed &&
    candidate.rank >= (state.appliedRanks.get(path) ?? 0) &&
    (!prior || compareDeriveWrites(candidate, prior) >= 0);
  if (wins) {
    const previousIndex = traceWinners.get(path);
    if (previousIndex !== undefined)
      trace[previousIndex] = { ...trace[previousIndex], result: 'lost' };
    winners.set(path, candidate);
    if (state.isTraceEnabled) traceWinners.set(path, trace.length);
  }
  if (state.isTraceEnabled)
    trace.push({
      phase: 'derive',
      kind: candidate.kind,
      sourcePath,
      targetPath: path,
      previousValue: candidate.target?.storedOutputValue,
      nextValue: candidate.value,
      result: state.isAutomaticWriteSuppressed
        ? 'suppressed'
        : wins
          ? 'applied'
          : 'lost',
    });
};
