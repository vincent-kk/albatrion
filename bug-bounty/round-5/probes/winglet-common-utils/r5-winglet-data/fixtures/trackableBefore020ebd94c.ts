// Fixture: the implementation body of getTrackableHandler at 020ebd94c^ (before the round-3
// common-utils 2 fix), transcribed from `git show 020ebd94c^:<file>` with its JSDoc removed and the
// `./type` import pointed at the current type file. Used only to show when the probe's defect appeared.
import { reportHostError } from '@/common-utils/utils/errorReporting/reportHostError';
import type {
  StateManager,
  TrackableHandlerFunction,
  TrackableHandlerOptions,
} from '@/common-utils/utils/function/enhance/getTrackableHandler/type';

import type { Dictionary, Fn } from '@aileron/declare';

export function getTrackableHandlerBefore020ebd94c<
  Args extends any[] = [],
  Result = void,
  State extends Dictionary = {},
>(
  origin: Fn<Args, Promise<Result>>,
  options?: TrackableHandlerOptions<Args, State>,
): TrackableHandlerFunction<Args, Result, State> {
  const {
    preventConcurrent = true,
    initialState,
    beforeExecute,
    afterExecute,
  } = options || {};
  const listeners = new Set<Fn>();
  let pending = false;
  let pendingCallCount = 0;
  let state = (initialState ? { ...initialState } : {}) as State;
  let hookRunning = false;

  const publish = (completion = false) => {
    let failures: unknown[] | undefined;
    for (const listener of listeners) {
      try { listener(); }
      catch (error) { (failures ??= []).push(error); }
    }
    if (failures !== undefined) {
      for (let index = completion ? 0 : 1; index < failures.length; index++)
        reportHostError(failures[index]);
      if (!completion) throw failures[0];
    }
  };

  const update = (
    updater: Partial<State> | Fn<[prev: State], Partial<State>>,
  ) => {
    const update = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...update };
    if (!hookRunning) publish();
  };

  const stateManager: StateManager<State> = {
    get state(): State {
      return state;
    },
    update,
  };

  const handler = beforeExecute || afterExecute ? async (...args: Args): Promise<Result | undefined> => {
    if (preventConcurrent && pending) return undefined;
    hookRunning = true;
    try {
      beforeExecute?.(args, stateManager);
    } catch (error) {
      hookRunning = false;
      publish();
      throw error;
    } finally {
      hookRunning = false;
    }
    pendingCallCount++;
    pending = true;

    try {
      publish();
      return await origin(...args);
    } finally {
      hookRunning = true;
      try {
        afterExecute?.(args, stateManager);
      } finally {
        hookRunning = false;
        pending = --pendingCallCount > 0;
        publish(true);
      }
    }
  } : async (...args: Args): Promise<Result | undefined> => {
    if (preventConcurrent && pending) return undefined;
    pendingCallCount++;
    pending = true;
    try {
      publish();
      return await origin(...args);
    } finally {
      pending = --pendingCallCount > 0;
      publish(true);
    }
  };

  Object.defineProperty(handler, 'subscribe', {
    value: (listener: Fn): Fn => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    configurable: false,
    enumerable: false,
  });
  Object.defineProperty(handler, 'pending', { get: () => pending, configurable: false, enumerable: false });
  Object.defineProperty(handler, 'state', { get: () => state, configurable: false, enumerable: false });
  return handler as TrackableHandlerFunction<Args, Result, State>;
}
