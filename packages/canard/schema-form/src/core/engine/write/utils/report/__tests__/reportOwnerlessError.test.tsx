// Vitest render projects select .test.tsx for real DOM event dispatch in jsdom.
import { expect, it, vi } from 'vitest';

import { reportOwnerlessError } from '../reportOwnerlessError';

// filid:contract ERROR-008
it('lets a host preventDefault on the ownerless ErrorEvent to suppress console fallback', () => {
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  const failure = new Error('ownerless browser failure');
  const events: ErrorEvent[] = [];
  const onError = (event: ErrorEvent) => {
    events.push(event);
    event.preventDefault();
  };
  vi.stubGlobal('reportError', undefined);
  window.addEventListener('error', onError);
  try {
    reportOwnerlessError(failure);
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ErrorEvent);
    expect(events[0].error).toBe(failure);
    expect(events[0].message).toBe(String(failure));
    expect(consoleError).not.toHaveBeenCalled();
    expect(events[0].cancelable).toBe(true);
    expect(events[0].defaultPrevented).toBe(true);
  } finally {
    window.removeEventListener('error', onError);
    vi.unstubAllGlobals();
    consoleError.mockRestore();
  }
});
