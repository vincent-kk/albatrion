import type { GateWheelFrame, GateWheelInput } from '../../types/gateWheel';

/**
 * Accumulate a witness input using the same first-value and Object.is rule in either frame.
 * @param frame - Real or shadow frame; no work when absent
 * @param input - One positional read, including its channel and absolute path
 * @returns Nothing; stores the first input and marks differing repeats inconsistent
 */
export const recordGateFrameInput = (
  frame: Pick<GateWheelFrame, 'inputs' | 'consistent'> | undefined,
  input: GateWheelInput,
): void => {
  if (!frame) return;
  const key =
    input.key ??
    (input.kind === 'value' ? input.path : `${input.kind}:${input.path}`);
  const previous = frame.inputs.get(key);
  if (previous) {
    if (!Object.is(previous.value, input.value)) frame.consistent = false;
  } else frame.inputs.set(key, input);
};
