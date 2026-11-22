import { expect, it, vi } from 'vitest';

import { withTimeout } from '../index';

it('checks timer-cancellation capability before starting the wrapped operation', () => {
  const start = vi.fn(async () => 'done');
  vi.stubGlobal('AbortController', undefined);
  try {
    expect(() => withTimeout(start, 1000)).toThrow();
    expect(start).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
