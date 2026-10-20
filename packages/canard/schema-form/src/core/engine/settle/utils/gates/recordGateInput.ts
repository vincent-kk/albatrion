import type { FieldNodeRecord } from '../../../record';
import type { GateWheelInput } from '../../types/gateWheel';
import type { SettlementContext } from '../../types/settlement';

/**
 * Retain each distinct read and reject different values at the same input site.
 * @param context - Settlement with the currently executing host frame, if any
 * @param path - Absolute dependency or host path; empty for the binding context
 * @param value - Value already read by the real evaluation
 * @param kind - Dependency publication, projected host extras, or binding context
 * @returns Nothing; the frame records the first value and any inconsistency
 */
export const recordGateInput = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  value: unknown,
  kind: GateWheelInput['kind'] = 'value',
): void => {
  const frame = context.gateWheelFrame;
  if (!frame) return;
  const key = kind === 'value' ? path : `${kind}:${path}`;
  const previous = frame.inputs.get(key);
  if (previous) {
    if (!Object.is(previous.value, value)) frame.consistent = false;
  } else frame.inputs.set(key, { path, kind, value });
};
