import type { SchemaNodeRecord } from '../../../../../record';
import type { DeriveState, DeriveTraceEntry, DeriveWrite } from '../../../type';
import { compareDeriveWrites } from '../../rank/compareDeriveWrites';

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
export const chooseDeriveWrite = <Self extends SchemaNodeRecord<Self>>(
  candidate: DeriveWrite<Self>, sourcePath: string, state: DeriveState<Self>,
  winners: Map<string, DeriveWrite<Self>>, trace: DeriveTraceEntry[],
  traceWinners: Map<string, number>,
): void => {
  const path = candidate.targetPath;
  const prior = winners.get(path);
  const wins = !state.suppressAutomaticWrites &&
    candidate.rank >= (state.appliedRanks.get(path) ?? 0) &&
    (!prior || compareDeriveWrites(candidate, prior) >= 0);
  if (wins) {
    const previousIndex = traceWinners.get(path);
    if (previousIndex !== undefined)
      trace[previousIndex] = { ...trace[previousIndex], result: 'lost' };
    winners.set(path, candidate);
    if (state.trace) traceWinners.set(path, trace.length);
  }
  if (state.trace) trace.push({ phase: 'derive', kind: candidate.kind,
    sourcePath, targetPath: path, previousValue: candidate.target?.emit,
    nextValue: candidate.value, result: state.suppressAutomaticWrites ?
      'suppressed' : wins ? 'applied' : 'lost' });
};
