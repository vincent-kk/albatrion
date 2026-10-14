import { expect, waitFor } from 'storybook/test';

/** Frames a matched reading must stay equal, so a late change after the first match still fails the check. */
const HOLD_FRAMES = 5;

/**
 * Wait until a screen or state reading equals the expected value, then require it to stay equal for five frames.
 * @param read - Reads the current value each attempt.
 * @param expected - Value compared with toEqual.
 * @param label - Assertion message.
 * @returns Completion once the reading has matched and held.
 * @throws The last mismatch when the waitFor timeout elapses, or the first held frame that differs.
 */
export async function expectEventually(read: () => unknown, expected: unknown, label: string): Promise<void> {
  await waitFor(() => expect(read(), label).toEqual(expected));
  for (let frame = 0; frame < HOLD_FRAMES; frame++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(read(), `${label} (held)`).toEqual(expected);
  }
}
