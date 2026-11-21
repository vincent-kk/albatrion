import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A host MessageChannel stand-in. Delivery is a macrotask, as in browsers and Node, and an
 * exception that escapes `onmessage` is recorded here the way a browser reports it to
 * `window.onerror` (Node raises it as an uncaught exception).
 */
const hostErrors: unknown[] = [];
class FakePort {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  other!: FakePort;
  postMessage(data: unknown) {
    setTimeout(() => {
      const handler = this.other.onmessage;
      if (!handler) return;
      try {
        handler({ data });
      } catch (error) {
        hostErrors.push(error);
      }
    }, 0);
  }
  close() {}
}
class FakeChannel {
  port1 = new FakePort();
  port2 = new FakePort();
  constructor() {
    this.port1.other = this.port2;
    this.port2.other = this.port1;
  }
}

const globalScope = globalThis as unknown as Record<string, unknown>;
const nativeChannel = globalScope.MessageChannel;
const nativeSetImmediate = globalScope.setImmediate;
const nativeClearImmediate = globalScope.clearImmediate;
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('MessageChannelScheduler with an onTaskError that throws', () => {
  beforeEach(() => {
    vi.resetModules();
    hostErrors.length = 0;
    globalScope.MessageChannel = FakeChannel;
  });
  afterEach(() => {
    globalScope.MessageChannel = nativeChannel;
    vi.resetModules();
  });

  it('runs the rest of the batch once, does not re-run the failing task, and keeps scheduling', async () => {
    const { MessageChannelScheduler } = await import(
      '@/common-utils/utils/scheduler/index'
    );
    const scheduler = MessageChannelScheduler.getInstance({
      onTaskError: (error) => {
        throw error;
      },
    });
    const runs: string[] = [];
    scheduler.schedule(() => {
      runs.push('a');
      throw new Error('a failed');
    });
    scheduler.schedule(() => runs.push('b'));
    scheduler.schedule(() => runs.push('c'));
    await settle();
    scheduler.schedule(() => runs.push('d'));
    await settle();
    scheduler.schedule(() => runs.push('e'));
    await settle();
    scheduler.destroy();
    expect(runs).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('scheduleMacrotask in a host without setImmediate (every browser)', () => {
  beforeEach(() => {
    vi.resetModules();
    hostErrors.length = 0;
    globalScope.MessageChannel = FakeChannel;
    delete globalScope.setImmediate;
    delete globalScope.clearImmediate;
  });
  afterEach(() => {
    globalScope.MessageChannel = nativeChannel;
    globalScope.setImmediate = nativeSetImmediate;
    globalScope.clearImmediate = nativeClearImmediate;
    vi.resetModules();
  });

  it('an exception thrown by the callback reaches the host instead of vanishing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { scheduleMacrotask, scheduleCancelableMacrotask } = await import(
      '@/common-utils/utils/scheduler/index'
    );
    scheduleMacrotask(() => {
      throw new Error('callback failed');
    });
    scheduleCancelableMacrotask(() => {
      throw new Error('cancelable callback failed');
    });
    await settle();
    const reported = hostErrors.length + consoleError.mock.calls.length;
    consoleError.mockRestore();
    // Native setImmediate (Node) and the Safe variant's setTimeout both surface the
    // exception to the host; here nothing is reported anywhere.
    expect(reported).toBe(2);
  });
});
