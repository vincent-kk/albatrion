import { afterEach, describe, expect, it, vi } from 'vitest';

import { settleUpdates } from '../settleUpdates';
import { drainTicks } from '../setup-env';

afterEach(() => vi.restoreAllMocks());

describe('update settlement scheduling', () => {
  it('drains immediate turns without requesting a clamped timer', async () => {
    const timer = vi.spyOn(globalThis, 'setTimeout');
    await drainTicks(2);
    expect(timer).not.toHaveBeenCalled();
  });

  it('waits for legacy microtask, timer delivery and macrotask reset', async () => {
    const events: string[] = [];
    queueMicrotask(() => {
      events.push('cascade');
      setTimeout(() => {
        events.push('root-change');
        setImmediate(() => events.push('batch-reset'));
      }, 0);
    });
    await settleUpdates();
    expect(events).toEqual(['cascade', 'root-change', 'batch-reset']);
  });

  it('uses MessageChannel when setImmediate is unavailable', async () => {
    const immediate = globalThis.setImmediate;
    vi.stubGlobal('setImmediate', undefined);
    try {
      const timer = vi.spyOn(globalThis, 'setTimeout');
      await drainTicks(2);
      expect(timer).not.toHaveBeenCalled();
    } finally {
      vi.stubGlobal('setImmediate', immediate);
    }
  });
});
