import type { FormHandle } from '@canard/schema-form';

import type { CoreFixture } from '../../../fixtures/core/types';
import type { CoreInputRecord } from '../types';

/**
 * Validate real keyboard coverage and compute handler cost per write.
 * @param fixture - Expected field path and operation-specific write count.
 * @param records - Native capture/bubble evidence collected during the operation.
 * @param handle - Current public form handle used to verify the final node value.
 * @param container - Browser-owned DOM root used to verify the native value.
 * @returns Mean capture-to-bubble handler duration in milliseconds per write.
 * @throws If any write is missing, synthetic, unfinished, or absent from node/DOM state.
 */
export function measureCoreWrites(
  fixture: CoreFixture,
  records: CoreInputRecord[],
  handle: FormHandle,
  container: HTMLElement,
): number {
  const expected = fixture.operation === 'first-key' ? 1 : 20;
  if (records.length !== expected)
    throw new Error('Core write count mismatch: ' + fixture.id);
  let total = 0;
  for (const record of records) {
    if (
      !record.trusted ||
      record.durationMs === undefined ||
      !Number.isFinite(record.durationMs) ||
      record.durationMs < 0
    )
      throw new Error('Core write is synthetic or incomplete: ' + fixture.id);
    total += record.durationMs;
  }
  const last = records[records.length - 1];
  const input = container.querySelector(`[id="${fixture.target}"]`);
  const node = handle.findNode(fixture.target);
  if (
    !last ||
    !(input instanceof HTMLInputElement) ||
    !node ||
    input.value !== last.value ||
    String(node.value) !== last.value
  )
    throw new Error('Core final input value mismatch: ' + fixture.id);
  return total / expected;
}
