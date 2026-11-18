import { afterEach, expect, it, vi } from 'vitest';
import { reportHostError } from '../reportHostError';

afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it('reports the same original error when the host provides reportError', () => {
  const report = vi.fn(); vi.stubGlobal('reportError', report);
  const error = new Error('failure'); reportHostError(error);
  expect(report).toHaveBeenCalledWith(error);
});

it('uses a separate throwing task when reportError is unavailable', () => {
  vi.useFakeTimers(); vi.stubGlobal('reportError', undefined);
  const error = new Error('failure');
  expect(() => reportHostError(error)).not.toThrow();
  expect(() => vi.runAllTimers()).toThrow(error);
});
