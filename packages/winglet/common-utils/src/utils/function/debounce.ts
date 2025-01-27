import type { Fn } from '@aileron/types';

import { FunctionContext } from './helpers/FunctionContext';
import { type ExecutionOptions, ExecutionPolicy } from './helpers/type';

export interface DebouncedFn<F extends Fn<any[]>> {
  (...args: Parameters<F>): void;
  execute: Fn;
  clear: Fn;
}

export const debounce = <F extends Fn<any[]>>(
  fn: F,
  ms: number,
  { signal, policy = [ExecutionPolicy.Trailing] }: ExecutionOptions = {},
): DebouncedFn<F> => {
  const context = new FunctionContext(fn, ms);

  const leading = policy.includes(ExecutionPolicy.Leading);
  const trailing = policy.includes(ExecutionPolicy.Trailing);

  const debounced = function (this: any, ...args: Parameters<F>) {
    if (signal?.aborted) return;
    const immediate = leading && context.isIdle;
    context.setArguments(this, args);
    context.schedule(trailing);
    if (immediate) context.execute();
  };

  debounced.execute = () => context.manualExecute();
  debounced.clear = () => context.clear();

  signal?.addEventListener('abort', () => context.clear(), {
    once: true,
  });

  return debounced;
};
