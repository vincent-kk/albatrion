import type { Dictionary, Fn } from '@aileron/declare';

import type {
  StateManager,
  TrackableHandlerFunction,
  TrackableHandlerOptions,
} from './type';

export function getTrackableHandler<
  Args extends any[] = [],
  Result = any,
  State extends Dictionary = {},
>(
  origin: Fn<Args, Promise<Result>>,
  options: TrackableHandlerOptions<Args, State>,
): TrackableHandlerFunction<Args, Result, State> {
  const {
    preventConcurrent = true,
    initialState,
    beforeExecute,
    afterExecute,
  } = options;

  const listeners = new Set<Fn>();
  let state = { ...initialState };

  const notify = (): void => {
    listeners.forEach((fn) => fn());
  };

  const update = (
    updater: Partial<State> | ((prev: State) => Partial<State>),
  ): void => {
    const update = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...update };
    notify();
  };

  const stateManager: StateManager<State> = {
    get state(): State {
      return state;
    },
    update,
  };

  const handler = async (...args: Args): Promise<Result> => {
    if (preventConcurrent && (state as any).loading === true)
      return Promise.resolve(undefined as Result);
    beforeExecute?.(args, stateManager);
    try {
      return await origin(...args);
    } finally {
      afterExecute?.(args, stateManager);
    }
  };

  Object.defineProperty(handler, 'subscribe', {
    value: (listener: Fn): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    configurable: false,
    enumerable: false,
  });

  Object.defineProperty(handler, 'state', {
    get(): State {
      return state;
    },
    configurable: false,
    enumerable: false,
  });

  for (const key of Object.keys(state)) {
    if (!Object.prototype.hasOwnProperty.call(handler, key)) {
      Object.defineProperty(handler, key, {
        get() {
          return state[key];
        },
        configurable: true,
        enumerable: true,
      });
    }
  }

  return handler as TrackableHandlerFunction<Args, Result, State>;
}
