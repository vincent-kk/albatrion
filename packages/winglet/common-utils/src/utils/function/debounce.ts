import type { Fn } from '@aileron/declare';

import { FunctionContext } from './helpers/FunctionContext';
import type { ExecutionOptions } from './helpers/type';

export interface DebouncedFn<F extends Fn<any[]>> {
  (...args: Parameters<F>): void;
  execute: Fn;
  clear: Fn;
}

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
