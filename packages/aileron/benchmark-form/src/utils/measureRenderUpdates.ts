import { flushSync } from 'react-dom';

import type { BenchHandle, Interaction } from '../../fixtures/equivalent/types';
import { applyInteraction } from '../../fixtures/equivalent/utils/applyInteraction';
import { settleUpdates } from './settleUpdates';

/**
 * Measures fixture writes and separate empty barriers with the runtime clock.
 * @param handle - Mounted form handle receiving every authored interaction
 * @param interactions - Ordered writes, each settled before the next begins
 * @returns Sums in ms; floor subtraction stays signed and is only an estimate
 */
export async function measureRenderUpdates(
  handle: BenchHandle,
  interactions: readonly Interaction[],
) {
  let sync = 0;
  let settled = 0;
  let idle = 0;
  for (const interaction of interactions) {
    const start = performance.now();
    flushSync(() => applyInteraction(handle, interaction));
    sync += performance.now() - start;
    await settleUpdates();
    settled += performance.now() - start;
    const idleStart = performance.now();
    await settleUpdates();
    idle += performance.now() - idleStart;
  }
  return {
    'update-sync': sync,
    'update-settled': settled,
    'update-idle-floor': idle,
    'update-settled-net': settled - idle,
  };
}
