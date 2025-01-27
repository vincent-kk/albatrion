import type { Fn } from '@aileron/types';

import type { ExecutionContext } from './type';

export class FunctionContext<F extends Fn<any[]>> {
  #context: ExecutionContext<F>;
  #timer: ReturnType<typeof setTimeout> | null = null;
  #function: F;
  #delay: number;

  get isIdle() {
    return this.#timer === null;
  }

  constructor(fn: F, ms: number) {
    this.#function = fn;
    this.#delay = ms;
    this.#context = {
      self: undefined,
      args: null,
    };
  }

  clear() {
    this.#clearTimer();
    this.#clearContext();
  }

  setArguments(self: any, args: Parameters<F>) {
    this.#context.self = self;
    this.#context.args = args;
  }

  execute() {
    if (this.#context.args === null) return;
    this.#function.apply(this.#context.self, this.#context.args);
    this.#clearContext();
  }

  schedule(execute?: boolean) {
    if (this.#timer !== null) clearTimeout(this.#timer);
    const timer = setTimeout(() => {
      this.#timer = null;
      if (execute) this.execute();
      this.clear();
    }, this.#delay);
    this.#timer = timer;
  }

  manualExecute() {
    this.execute();
    this.#clearTimer();
  }

  #clearContext() {
    this.#context.self = undefined;
    this.#context.args = null;
  }

  #clearTimer() {
    if (this.#timer === null) return;
    clearTimeout(this.#timer);
    this.#timer = null;
  }
}
