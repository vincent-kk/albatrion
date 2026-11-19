import type { Dictionary } from '@aileron/declare';
import type { StateManager } from '../type';

/** Call-owned hook progress; aggregate state belongs to the supplied owner. */
export class HookStateManager<State extends Dictionary> implements StateManager<State> {
  /** Whether this call is folding updates into its next lifecycle notification. */
  isHookRunning = true;

  /** Return the handler's current aggregate state. */
  get state(): State { return this.owner.state; }

  /** Apply an update, publishing immediately outside this call's hooks. */
  readonly update: StateManager<State>['update'] = updater => {
    this.owner.update(updater);
    if (!this.isHookRunning) this.publish();
  };

  /**
   * @param owner Shared aggregate state access, without execution state.
   * @param publish Synchronous subscription notification outside a hook.
   */
  constructor(
    private readonly owner: StateManager<State>,
    private readonly publish: () => void,
  ) {}
}
