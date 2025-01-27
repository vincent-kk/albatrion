import type { Fn } from '@aileron/types';

import { FunctionContext } from './helpers/FunctionContext';
import { type ExecutionOptions, ExecutionPolicy } from './helpers/type';

export interface ThrottledFn<F extends Fn<any[]>> {
  (...args: Parameters<F>): void;
  execute: Fn;
  clear: Fn;
}

export const throttle = <F extends Fn<any[]>>(
  fn: F,
  ms: number,
  {
    signal,
    policy = [ExecutionPolicy.Leading, ExecutionPolicy.Trailing],
  }: ExecutionOptions = {},
): ThrottledFn<F> => {
  const context = new FunctionContext(fn, ms);

  const leading = policy.includes(ExecutionPolicy.Leading);
  const trailing = policy.includes(ExecutionPolicy.Trailing);

  let previous: number | null = null;
  const throttled = function (this: any, ...args: Parameters<F>) {
    if (signal?.aborted) return;

    const current = Date.now();
    const immediately = leading && context.isIdle;

    if (previous === null) {
      previous = current;
      context.setArguments(this, args);
      context.schedule(trailing);
    } else {
      context.setArguments(this, args);
      if (current - previous > ms) {
        previous = current;
        context.schedule(trailing);
      }
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
