import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class Port {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  other!: Port;
  postMessage(data: unknown) {
    setTimeout(() => {
      this.other.onmessage?.({ data });
    }, 0);
  }
  close() {}
}
class Channel {
  port1 = new Port();
  port2 = new Port();
  constructor() {
    this.port1.other = this.port2;
    this.port2.other = this.port1;
  }
}

describe('round-3 browser wrapper error visibility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubGlobal('MessageChannel', Channel);
    vi.stubGlobal('setImmediate', undefined);
    vi.stubGlobal('clearImmediate', undefined);
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it.each([false, true])(
    'wrapper import order preserves host and direct-handler policies: custom=%s',
    async (custom) => {
      const observe = async (wrapperFirst: boolean) => {
        vi.resetModules();
        const report = vi.fn();
        vi.stubGlobal('reportError', report);
        const ownError = vi.fn();
        if (wrapperFirst) await import('../scheduleMacrotask');
        const { MessageChannelScheduler } = await import(
          '../MessageChannelScheduler/MessageChannelScheduler'
        );
        const direct = MessageChannelScheduler.getInstance(
          custom ? { onTaskError: ownError } : undefined,
        );
        const { scheduleMacrotask, scheduleCancelableMacrotask } = await import(
          '../scheduleMacrotask'
        );
        direct.schedule(() => {
          throw new Error('direct');
        });
        scheduleMacrotask(() => {
          throw new Error('wrapper');
        });
        scheduleCancelableMacrotask(() => {
          throw new Error('wrapper');
        });
        await vi.runAllTimersAsync();
        const observed = {
          host: report.mock.calls.map(([error]) => error.message),
          direct: ownError.mock.calls.map(([error]) => error.message),
        };
        direct.destroy();
        return observed;
      };
      const wrapperFirst = await observe(true);
      expect(wrapperFirst).toEqual({
        host: custom ? [] : ['direct', 'wrapper', 'wrapper'],
        direct: custom ? ['direct', 'wrapper', 'wrapper'] : [],
      });
      expect(await observe(false)).toEqual(wrapperFirst);
    },
  );

  it('a singleton first created by the wrapper uses the same host default for direct tasks', async () => {
    const report = vi.fn();
    vi.stubGlobal('reportError', report);
    const { scheduleMacrotask } = await import('../scheduleMacrotask');
    scheduleMacrotask(() => {
      throw new Error('wrapper');
    });
    const { MessageChannelScheduler } = await import(
      '../MessageChannelScheduler/MessageChannelScheduler'
    );
    const direct = MessageChannelScheduler.getInstance();
    direct.schedule(() => {
      throw new Error('direct');
    });
    await vi.runAllTimersAsync();
    expect(report.mock.calls.map(([error]) => error.message)).toEqual([
      'wrapper',
      'direct',
    ]);
    direct.destroy();
  });

  it('host fallback throws on a separate timer without scheduling recursively', async () => {
    vi.stubGlobal('reportError', undefined);
    const { MessageChannelScheduler } = await import(
      '../MessageChannelScheduler/MessageChannelScheduler'
    );
    const direct = MessageChannelScheduler.getInstance();
    const error = new Error('host fallback');
    const completed = vi.fn();
    direct.schedule(() => {
      throw error;
    });
    direct.schedule(completed);
    await Promise.resolve();
    await Promise.resolve();
    expect(() => vi.runAllTimers()).toThrow(error);
    expect(completed).toHaveBeenCalledTimes(1);
    expect(direct.getPendingCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    direct.destroy();
  });

  it('browser wrappers report errors like the native scheduler', async () => {
    const report = vi.fn();
    vi.stubGlobal('reportError', report);
    const { scheduleMacrotask, scheduleCancelableMacrotask } = await import(
      '../scheduleMacrotask'
    );
    const error = new Error('task');
    scheduleMacrotask(() => {
      throw error;
    });
    scheduleCancelableMacrotask(() => {
      throw error;
    });
    await vi.runAllTimersAsync();
    expect(report.mock.calls).toEqual([[error], [error]]);
  });
});
