import type { FieldNodeRecord } from '../../../record';
import type { GateWheelInput } from '../../types/gateWheel';
import type { SettlementContext } from '../../types/settlement';
import { recordGateFrameInput } from './recordGateFrameInput';

/**
 * Retain each distinct read and reject different values at the same input site.
 * @param context - Settlement with the currently executing host frame, if any
 * @param path - Absolute dependency or host path; '@' (JSONPointer.Context) for the binding context
 * @param value - Value already read by the real evaluation
 * @param kind - Dependency publication, projected host extras, or binding context
 * @returns Nothing; the frame records the first value and any inconsistency
 */
export const recordGateInput = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  value: unknown,
  kind: GateWheelInput['kind'] = 'value',
  site?: Omit<GateWheelInput, 'value'>,
): void => {
  const frame = context.gateWheelFrame;
  if (!frame) return;
  const key = site?.key ?? (kind === 'value' ? path : kind + ':' + path);
  const previous = frame.inputs.get(key);
  if (previous) {
    if (!Object.is(previous.value, value)) frame.consistent = false;
    if (frame.selectionShadow) {
      const shadow = frame.selectionShadow.inputs.get(key);
      if (shadow) {
        if (!Object.is(shadow.value, value))
          frame.selectionShadow.consistent = false;
      } else
        recordGateFrameInput(frame.selectionShadow, {
          path,
          kind,
          value,
          key,
          hostPath: site?.hostPath,
          name: site?.name,
        });
    }
    return;
  }
  const input = {
    path,
    kind,
    value,
    key,
    hostPath: site?.hostPath,
    name: site?.name,
  };
  recordGateFrameInput(frame, input);
  if (frame.selectionShadow) recordGateFrameInput(frame.selectionShadow, input);
};
