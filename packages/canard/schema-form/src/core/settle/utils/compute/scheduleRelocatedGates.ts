import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import type { GateOccurrence } from '../gates/type';

/**
 * Invalidate every host between L and its declaring fragment in this wheel.
 * @param gates - Gates whose evaluation host just changed projection
 * @param context - Dirty-path set for this synchronous descent
 * @returns Nothing; later wheel rounds recompute affected descendants
 */
export const scheduleRelocatedGates = <Self extends SchemaNodeRecord<Self>>(
  gates: readonly GateOccurrence[],
  context: SettlementContext<Self>,
): void => {
  for (const gate of gates) {
    let path = gate.hostPath;
    while (path !== gate.evaluationHostPath) {
      context.dirtyPaths.add(path);
      path = path.slice(0, path.lastIndexOf('/'));
    }
    context.dirtyPaths.add(gate.evaluationHostPath);
  }
};
