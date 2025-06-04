import type { Fn } from '@aileron/declare';

import { FunctionContext } from './helpers/FunctionContext';
import type { ExecutionOptions } from './helpers/type';

/**
 * Interface for a throttled function
 * @template F - Original function type
 */
export interface ThrottledFn<F extends Fn<any[]>> {
  /**
   * Call the throttled function
   * @param args - Arguments to pass to the original function
   */
  (...args: Parameters<F>): void;
  /** Execute the function immediately, ignoring the throttle timer */
  execute: Fn;
  /** Cancel scheduled function execution and reset the timer */
  clear: Fn;
}

/**
 * Creates a throttled function that limits the frequency of function calls
 * Even if called multiple times within a specified time, the function is executed only at specific intervals after the first call
 *
 * @template F - Type of function to throttle
 * @param fn - Original function to throttle
 * @param ms - Throttle interval in milliseconds
 * @param options - Throttle options
 * @param options.signal - AbortSignal to stop throttling
 * @param options.leading - If true, execute function immediately at throttle start (default: true)
 * @param options.trailing - If true, execute function at throttle end (default: true)
 * @returns Throttled function
 */
export const throttle = <F extends Fn<any[]>>(
  fn: F,
  ms: number,
  { signal, leading = true, trailing = true }: ExecutionOptions = {},
): ThrottledFn<F> => {
  const context = new FunctionContext(fn, ms);

  let previous = 0;
  const throttled = function (this: any, ...args: Parameters<F>) {
    if (signal?.aborted) return;
    const immediately = leading && context.isIdle;
    const current = Date.now();

    context.setArguments(this, args);

    if (current - previous > ms) {
      previous = current;
      context.schedule(trailing);
    }

    if (immediately) context.execute();
  };

  throttled.execute = () => context.execute();
  throttled.clear = () => context.clear();

  signal?.addEventListener('abort', () => context.clear(), {
    once: true,
  });

  return throttled;
};
