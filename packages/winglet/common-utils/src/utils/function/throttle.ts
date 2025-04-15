import type { Fn } from '@aileron/declare';

import { FunctionContext } from './helpers/FunctionContext';
import type { ExecutionOptions } from './helpers/type';

export interface ThrottledFn<F extends Fn<any[]>> {
  (...args: Parameters<F>): void;
  execute: Fn;
  clear: Fn;
}

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
