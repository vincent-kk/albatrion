import { afterEach, vi } from 'vitest';

const observers: (() => void)[] = [];
afterEach(() => { while (observers.length) observers.pop()!(); });

/**
 * Capture ownerless host reports and restore host hooks on cleanup.
 * @returns Original error observations and idempotent cleanup for this render.
 */
export const observeErrorSink = () => {
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.error ?? event.message);
    event.preventDefault();
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    errors.push(event.reason);
    event.preventDefault();
  };
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(args[0]);
  });
  const reportSpy = typeof globalThis.reportError === 'function'
    ? vi.spyOn(globalThis, 'reportError').mockImplementation((error) => { errors.push(error); })
    : undefined;
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  let active = true;
  const cleanup = () => {
    if (!active) return;
    active = false;
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    reportSpy?.mockRestore();
    consoleSpy.mockRestore();
  };
  observers.push(cleanup);
  return { errors: () => errors.slice(), cleanup };
};
