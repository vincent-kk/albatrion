import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { createSlotValueOverlay } from '../slots/createSlotValueOverlay';
import { readStoredInput } from './readStoredInput';

/**
 * Test a caller input with the promotion rule for the selected address.
 * @param input - Candidate input before any reactions
 * @param live - Live child, when the address currently has an occurrence
 * @param template - Blueprint for a latent declared address
 * @returns Whether the write can release a wrong-kind ancestor
 */
export const hasCallerInputOutput = <Self extends FieldNodeRecord<Self>>(
  input: unknown,
  live: Self | undefined,
  template: BlueprintNode | undefined = live?.blueprintNode,
): boolean => {
  if (live)
    return readStoredInput(live.blueprintNode, input, live, true) !== undefined;
  if (!template) return input !== undefined;
  return createSlotValueOverlay(template, input, undefined, undefined, false)
    .hasWritten;
};
