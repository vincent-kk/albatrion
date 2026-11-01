import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import type { GateWheelFrame } from '../../types/gateWheel';
import type { SettlementContext } from '../../types/settlement';
import { dirtyChildren } from '../compute/dirtyChildren';
import { readGateHostView } from './readGateHostView';
import { readGateProjectedExtra } from './readGateProjectedExtra';
import { readProjectedValue } from './readProjectedValue';

/**
 * Prove that the next wheel would receive every input of this host frame unchanged.
 * @param node - Host after selection, dirty child calculation and output publication
 * @param context - Settlement with no intervening caller writes
 * @param frame - Actual reads, gate count and exception version from this wheel
 * @param round - Zero-based completed wheel
 * @param cap - Updated wheel budget including newly relocated gates
 * @param gateCount - Number of gates after this wheel's registration
 * @returns Whether all seven confirmation-wheel conditions hold without flushing outputs
 */
export const canSkipGateWheel = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  frame: GateWheelFrame,
  round: number,
  cap: number,
  gateCount: number,
): boolean => {
  if (
    round + 1 >= cap ||
    gateCount !== frame.gateCount ||
    dirtyChildren(node, context).length !== 0 ||
    context.gateThrowVersion !== frame.throwVersion ||
    (context.pendingOutputs?.size ?? 0) !== 0 ||
    !frame.consistent ||
    context.kind === 'load' ||
    context.distributedInputs.has(node) ||
    context.exceededBudget
  )
    return false;
  for (const input of frame.inputs.values()) {
    const view =
      input.kind === 'property' || input.kind === 'presence'
        ? readGateHostView(context, input.hostPath!, node).value
        : undefined;
    const value =
      input.kind === 'context'
        ? context.root.runtime.context
        : input.kind === 'property'
          ? view![input.name!]
          : input.kind === 'presence'
            ? hasOwnProperty(view!, input.name!)
            : input.kind === 'extra'
              ? readGateProjectedExtra(
                  context,
                  input.path,
                  readProjectedValue(context, input.path),
                  node,
                )
              : readProjectedValue(context, input.path);
    if (!Object.is(input.value, value)) return false;
  }
  return true;
};
