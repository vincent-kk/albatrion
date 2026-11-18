import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class Port {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  other!: Port;
  postMessage(data: unknown) { setTimeout(() => { this.other.onmessage?.({ data }); }, 0); }
  close() {}
}
class Channel {
  port1 = new Port(); port2 = new Port();
  constructor() { this.port1.other = this.port2; this.port2.other = this.port1; }
}

describe('round-3 browser wrapper error visibility', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.resetModules(); vi.stubGlobal('MessageChannel', Channel); vi.stubGlobal('setImmediate', undefined); vi.stubGlobal('clearImmediate', undefined); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); });

  it.each([false, true])('wrapper host errors do not depend on earlier direct construction: custom=%s', async custom => {
    const report = vi.fn(); vi.stubGlobal('reportError', report);
    const ownError = vi.fn();
    const { MessageChannelScheduler } = await import('../MessageChannelScheduler/MessageChannelScheduler');
    const direct = MessageChannelScheduler.getInstance(custom ? { onTaskError: ownError } : undefined);
    const directError = new Error('direct');
    direct.schedule(() => { throw directError; });
    await vi.runAllTimersAsync();
    expect(report).not.toHaveBeenCalled();
    expect(ownError).toHaveBeenCalledTimes(custom ? 1 : 0);
    const { scheduleMacrotask, scheduleCancelableMacrotask } = await import('../scheduleMacrotask');
    const error = new Error('wrapper');
    scheduleMacrotask(() => { throw error; });
    scheduleCancelableMacrotask(() => { throw error; });
    await vi.runAllTimersAsync();
    expect(report.mock.calls).toEqual([[error], [error]]);
    expect(ownError).toHaveBeenCalledTimes(custom ? 1 : 0);
    direct.destroy();
  });

  it('browser wrappers report errors like the native scheduler', async () => {
    const report = vi.fn(); vi.stubGlobal('reportError', report);
    const { scheduleMacrotask, scheduleCancelableMacrotask } = await import('../scheduleMacrotask');
    const error = new Error('task');
    scheduleMacrotask(() => { throw error; });
    scheduleCancelableMacrotask(() => { throw error; });
    await vi.runAllTimersAsync();
    expect(report.mock.calls).toEqual([[error],[error]]);
  });
});
