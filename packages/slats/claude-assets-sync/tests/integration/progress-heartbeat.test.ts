import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { startHeartbeat } from '../../src/utils/heartbeat.js';

describe('heartbeat ticker (wall-clock, at command layer — not core)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits at least one heartbeat line while the operation is in flight', () => {
    const emissions: string[] = [];
    const stop = startHeartbeat({
      intervalMs: 500,
      emit: (line) => emissions.push(line),
      label: 'injecting',
    });

    vi.advanceTimersByTime(700);
    stop();

    expect(emissions.length).toBeGreaterThanOrEqual(1);
    expect(emissions[0]).toContain('injecting...');
  });

  it('emits multiple lines for longer operations', () => {
    const emissions: string[] = [];
    const stop = startHeartbeat({
      intervalMs: 500,
      emit: (line) => emissions.push(line),
    });

    vi.advanceTimersByTime(1600);
    stop();

    expect(emissions.length).toBeGreaterThanOrEqual(3);
  });

  it('stop() cancels further emissions', () => {
    const emissions: string[] = [];
    const stop = startHeartbeat({
      intervalMs: 500,
      emit: (line) => emissions.push(line),
    });

    vi.advanceTimersByTime(500);
    stop();
    const countAtStop = emissions.length;
    vi.advanceTimersByTime(5000);

    expect(emissions.length).toBe(countAtStop);
  });

  it('emits nothing if stopped before the first tick', () => {
    const emissions: string[] = [];
    const stop = startHeartbeat({
      intervalMs: 500,
      emit: (line) => emissions.push(line),
    });

    vi.advanceTimersByTime(100);
    stop();

    expect(emissions).toHaveLength(0);
  });
});
