/** Hook return modes exercised by the state-machine property. */
export type HookMode = 'none' | 'sync' | 'async' | 'reject' | 'throw' | 'thenable' | 'never';
/** Supported origin completion kinds; synchronous non-Promise returns are outside the API. */
export type OriginMode = 'async' | 'reject' | 'throw' | 'never';
/** Call-local phases; finished managers remain usable. */
type Phase = 'before' | 'origin' | 'after' | 'finished';
/** Observable commands; IDs identify calls or subscriptions, never array positions. */
export type ModelEvent = { kind: 'call' | 'before' | 'origin' | 'throw' | 'after' | 'update' | 'equal' | 'empty' | 'updateThrow' | 'subscribe' | 'unsubscribe'; id: number };

/** One-shot user callback behavior; nested update failures are caught by that callback. */
export type CallbackPlan = { site: 'before' | 'origin' | 'after' | 'publish'; id: number; events: ModelEvent[]; throws?: boolean };

/** Executable contract independent of Promise continuation structure. */
export class TrackableModel {
  /** Current aggregate state. */
  value: number | undefined;
  /** Published snapshots in listener invocation order. */
  notifications: Array<[number | undefined, boolean, number]> = [];
  /** Hook and origin invocation counts. */
  counts = { before: 0, origin: 0, after: 0 };
  /** Persistent call phases, including managers saved after completion. */
  phases = new Map<number, Phase>();
  /** Calls whose hooks have received a manager. */
  managers = new Set<number>();
  /** Active subscriptions, matching native Set identity semantics. */
  listeners = new Set<number>();

  /** Callback plans already executed, preventing unbounded user recursion. */
  callbacksRun = new Set<number>();

  /** Construct a model with the same admission and hook modes as the subject. */
  constructor(readonly guarded: boolean, readonly before: HookMode, readonly after: HookMode, readonly origin: OriginMode = 'async', initialState = true, readonly callbacks: readonly CallbackPlan[] = []) { this.value = initialState ? 0 : undefined; }

  /** Whether at least one admitted call has not finished. */
  get pending(): boolean { return [...this.phases.values()].some(phase => phase !== 'finished'); }

  /** Deliver the current aggregate snapshot to every active subscription. */
  publish(): boolean {
    let failed = false;
    for (const listener of this.listeners) {
      this.notifications.push([this.value, this.pending, listener]);
      failed = this.runCallbacks('publish', listener) || failed;
    }
    return failed;
  }

  /** Execute bounded user actions independently of the real handler adapter. */
  runCallbacks(site: CallbackPlan['site'], id: number): boolean {
    let failed = false;
    this.callbacks.forEach((plan, index) => {
      if (plan.site !== site || plan.id !== id || this.callbacksRun.has(index)) return;
      this.callbacksRun.add(index);
      for (const event of plan.events) this.apply(event);
      failed = Boolean(plan.throws) || failed;
    });
    return failed;
  }

  /** Enter origin only after the before hook succeeds. */
  startOrigin(id: number): void {
    this.phases.set(id, 'origin');
    if (this.publish()) { this.completeOrigin(id); return; }
    this.counts.origin++;
    if (this.runCallbacks('origin', id) || this.origin === 'throw') this.completeOrigin(id);
  }

  /** Finish cleanup before delivering completion. */
  finish(id: number): void { this.phases.set(id, 'finished'); this.publish(); }

  /** Enter after, preserving before-failure short circuit and hook counts. */
  completeOrigin(id: number): void {
    this.phases.set(id, 'after');
    if (this.after !== 'none') { this.counts.after++; this.managers.add(id); }
    const callbackFailed = this.after !== 'none' && this.runCallbacks('after', id);
    if (callbackFailed || this.after === 'none' || this.after === 'sync' || this.after === 'throw') this.finish(id);
  }

  /** Apply one external event, ignoring settlements that cannot occur in the current phase. */
  apply(event: ModelEvent): void {
    const { kind, id } = event;
    const phase = this.phases.get(id);
    if (kind === 'subscribe') { this.listeners.add(id); return; }
    if (kind === 'unsubscribe') { this.listeners.delete(id); return; }
    if (kind === 'update' || kind === 'equal' || kind === 'empty' || kind === 'updateThrow') {
      if (!this.managers.has(id)) return;
      if (kind === 'updateThrow') return;
      if (kind === 'update') this.value = (this.value ?? 0) + 1;
      if (phase === 'origin' || phase === 'finished') this.publish();
      return;
    }
    if (kind === 'call') {
      if (this.guarded && this.pending) return;
      this.phases.set(id, 'before');
      if (this.before !== 'none') { this.counts.before++; this.managers.add(id); }
      const callbackFailed = this.before !== 'none' && this.runCallbacks('before', id);
      if (callbackFailed || this.before === 'throw') this.finish(id);
      else if (this.before === 'none' || this.before === 'sync') this.startOrigin(id);
    } else if (kind === 'before' && phase === 'before' && this.before !== 'never') {
      if (this.before === 'reject') this.finish(id);
      else this.startOrigin(id);
    }
    else if ((kind === 'origin' || kind === 'throw') && phase === 'origin') {
      if (this.origin !== 'never') this.completeOrigin(id);
    } else if (kind === 'after' && phase === 'after' && this.after !== 'never') this.finish(id);
  }
}
