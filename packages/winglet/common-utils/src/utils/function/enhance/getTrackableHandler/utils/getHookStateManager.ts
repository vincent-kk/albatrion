import type { Dictionary } from '@aileron/declare';

import type { StateManager } from '../type';

/**
 * Bind aggregate state once, leaving only call progress in each manager.
 * @param owner Shared state storage without hook progress.
 * @param publish Immediate update notification outside the owning call's hooks.
 * @returns Constructor whose instances independently own hook progress and updater bindings.
 */
export function getHookStateManager<State extends Dictionary>(
  owner: StateManager<State>,
  publish: () => void,
): new () => StateManager<State> & { isHookRunning: boolean } {
  return class {
    /** Whether this call is waiting for a lifecycle hook. */
    isHookRunning = true;
    /** Bound only when a hook requests its updater. */
    declare private __update__: StateManager<State>['update'] | undefined;
    /** Read the handler's latest aggregate state. */
    get state(): State { return owner.state; }
    /** Apply shared state and use only this call's phase to decide publication. */
    get update(): StateManager<State>['update'] {
      return this.__update__ ??= updater => {
        owner.update(updater);
        if (!this.isHookRunning) publish();
      };
    }
  };
}
