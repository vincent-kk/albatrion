import { afterEach, describe, expect, it, vi } from 'vitest';

// Runs the documented "Event loop execution order" example of scheduleMacrotask
// (src/utils/scheduler/scheduleMacrotask.ts, "Final order" line) on both host paths.
const runDocumentedExample = async (
  scheduleMacrotask: (callback: () => void) => unknown,
) => {
  const executionOrder: string[] = [];
  executionOrder.push('sync-1');
  scheduleMacrotask(() => {
    executionOrder.push('macrotask-1');
    queueMicrotask(() => {
      executionOrder.push('nested-microtask');
    });
    scheduleMacrotask(() => {
      executionOrder.push('nested-macrotask');
    });
  });
  queueMicrotask(() => {
    executionOrder.push('microtask-1');
  });
  scheduleMacrotask(() => {
    executionOrder.push('macrotask-2');
  });
  executionOrder.push('sync-2');
  await new Promise((resolve) => setTimeout(resolve, 30));
  return executionOrder;
};

const DOCUMENTED = [
  'sync-1',
  'sync-2',
  'microtask-1',
  'macrotask-1',
  'macrotask-2',
  'nested-microtask',
  'nested-macrotask',
];

const nativeSetImmediate = globalThis.setImmediate;
const nativeClearImmediate = globalThis.clearImmediate;

afterEach(() => {
  globalThis.setImmediate = nativeSetImmediate;
  globalThis.clearImmediate = nativeClearImmediate;
  vi.resetModules();
});

describe('scheduleMacrotask gives the documented order on every host path', () => {
  it('Node path (native setImmediate) matches the documented final order', async () => {
    vi.resetModules();
    const { scheduleMacrotask } = await import(
      '@/common-utils/utils/scheduler/scheduleMacrotask'
    );
    expect(await runDocumentedExample(scheduleMacrotask)).toEqual(DOCUMENTED);
  });

  it('browser path (MessageChannelScheduler) matches the documented final order', async () => {
    // @ts-expect-error -- remove the Node global to take the browser path
    delete globalThis.setImmediate;
    // @ts-expect-error -- remove the Node global to take the browser path
    delete globalThis.clearImmediate;
    vi.resetModules();
    const { scheduleMacrotask } = await import(
      '@/common-utils/utils/scheduler/scheduleMacrotask'
    );
    const { destroyGlobalScheduler } = await import(
      '@/common-utils/utils/scheduler/MessageChannelScheduler'
    );
    try {
      expect(await runDocumentedExample(scheduleMacrotask)).toEqual(DOCUMENTED);
    } finally {
      destroyGlobalScheduler();
    }
  });

  it('two tasks queued together see the same microtask order as two tasks queued apart (browser path)', async () => {
    // @ts-expect-error -- remove the Node global to take the browser path
    delete globalThis.setImmediate;
    // @ts-expect-error -- remove the Node global to take the browser path
    delete globalThis.clearImmediate;
    vi.resetModules();
    const { scheduleMacrotask } = await import(
      '@/common-utils/utils/scheduler/scheduleMacrotask'
    );
    const { destroyGlobalScheduler } = await import(
      '@/common-utils/utils/scheduler/MessageChannelScheduler'
    );
    const run = async (apart: boolean) => {
      const order: string[] = [];
      scheduleMacrotask(() => {
        order.push('a');
        queueMicrotask(() => order.push('a-microtask'));
      });
      if (apart) await new Promise((resolve) => setTimeout(resolve, 0));
      scheduleMacrotask(() => order.push('b'));
      await new Promise((resolve) => setTimeout(resolve, 30));
      return order;
    };
    try {
      const apart = await run(true);
      const together = await run(false);
      expect({ together }).toEqual({ together: apart });
    } finally {
      destroyGlobalScheduler();
    }
  });
});
