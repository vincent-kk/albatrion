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

describe('round-3 scheduler failure isolation', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.resetModules(); vi.stubGlobal('MessageChannel', Channel); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); });

  it('a throwing error handler leaves the batch equivalent to a nonthrowing error handler', async () => {
    const report = vi.fn(); vi.stubGlobal('reportError', report);
    const { MessageChannelScheduler } = await import('../MessageChannelScheduler');
    const expected: string[] = [];
    const actual: string[] = [];
    for (const throws of [false,true]) {
      const runs = throws ? actual : expected;
      const scheduler = MessageChannelScheduler.getInstance({onTaskError: error => { if(throws) throw error; }});
      scheduler.schedule(() => { runs.push('a'); throw new Error('a'); });
      scheduler.schedule(() => { runs.push('b'); });
      await vi.runAllTimersAsync();
      scheduler.schedule(() => { runs.push('c'); });
      await vi.runAllTimersAsync();
      scheduler.destroy();
    }
    expect(actual).toEqual(expected);
    expect(actual).toEqual(['a','b','c']);
    expect(report).toHaveBeenCalledTimes(1);
  });
});
