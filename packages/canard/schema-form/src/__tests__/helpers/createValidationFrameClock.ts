import { vi } from 'vitest';

/** Create a host frame queue with independently controlled monotone time.
 * @returns A clock, manual frame step, task drain and pending-frame count. */
export const createValidationFrameClock = () => {
  let time = 0;
  let next = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  if (typeof document === 'undefined')
    vi.stubGlobal('document', { hidden: false });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callbacks.set(++next, callback);
    return next;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => callbacks.delete(id));
  return {
    now: () => time,
    pending: () => callbacks.size,
    frame: (milliseconds = 16) => {
      time += milliseconds;
      const batch = [...callbacks.values()];
      callbacks.clear();
      for (const callback of batch) callback(time);
    },
    task: () => new Promise<void>((resolve) => setImmediate(resolve)),
  };
};
