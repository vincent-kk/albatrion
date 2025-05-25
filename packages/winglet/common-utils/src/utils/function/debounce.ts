import type { Fn } from '@aileron/declare';

import { FunctionContext } from './helpers/FunctionContext';
import type { ExecutionOptions } from './helpers/type';

/**
 * Interface for a debounced function
 * @template F - Original function type
 */
export interface DebouncedFn<F extends Fn<any[]>> {
  /**
   * Call the debounced function
   * @param args - Arguments to pass to the original function
   */
  (...args: Parameters<F>): void;
  /** Execute the function immediately, ignoring the debounce timer */
  execute: Fn;
  /** Cancel scheduled function execution and reset the timer */
  clear: Fn;
}

/**
 * Creates a debounced function that delays function calls for a specific time
 * When continuous calls occur, the function is executed only after the specified time has elapsed since the last call
 *
 * @template F - Type of function to debounce
 * @param fn - Original function to debounce
 * @param ms - Debounce time in milliseconds
 * @param options - Debounce options
 * @param options.signal - AbortSignal to stop debouncing
 * @param options.leading - If true, execute function immediately at debounce start (default: false)
 * @param options.trailing - If true, execute function at debounce end (default: true)
 * @returns Debounced function
 */
export const debounce = <F extends Fn<any[]>>(
  fn: F,
  ms: number,
  { signal, leading = false, trailing = true }: ExecutionOptions = {},
): DebouncedFn<F> => {
  const context = new FunctionContext(fn, ms);

  const debounced = function (this: any, ...args: Parameters<F>) {
    if (signal?.aborted) return;
    const immediately = leading && context.isIdle;

    context.setArguments(this, args);
    context.schedule(trailing);

    if (immediately) context.execute();
  };

  debounced.execute = () => context.manualExecute();
  debounced.clear = () => context.clear();

  signal?.addEventListener('abort', () => context.clear(), {
    once: true,
  });

  return debounced;
};
