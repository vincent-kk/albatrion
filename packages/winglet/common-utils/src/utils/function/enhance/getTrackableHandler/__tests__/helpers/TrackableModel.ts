/** Hook return modes exercised by the state-machine property. */
export type HookMode = 'none' | 'sync' | 'async';
/** Call-local phases; finished managers remain usable. */
type Phase = 'before' | 'origin' | 'after' | 'finished';
/** Observable commands; IDs identify calls or subscriptions, never array positions. */
export type ModelEvent = { kind: 'call' | 'before' | 'origin' | 'throw' | 'after' | 'update' | 'subscribe' | 'unsubscribe'; id: number };

/** Executable contract independent of Promise continuation structure. */
export class TrackableModel {
  /** Current aggregate state. */
  value = 0;
  /** Published snapshots in listener invocation order. */
  notifications: Array<[number, boolean, number]> = [];
  /** Hook and origin invocation counts. */
  counts = { before: 0, origin: 0, after: 0 };
  /** Persistent call phases, including managers saved after completion. */
  phases = new Map<number, Phase>();
  /** Calls whose hooks have received a manager. */
  managers = new Set<number>();
  /** Active subscriptions, matching native Set identity semantics. */
  listeners = new Set<number>();

  /** Construct a model with the same admission and hook modes as the subject. */
  constructor(readonly guarded: boolean, readonly before: HookMode, readonly after: HookMode) {}

  /** Whether at least one admitted call has not finished. */
  get pending(): boolean { return [...this.phases.values()].some(phase => phase !== 'finished'); }

  /** Deliver the current aggregate snapshot to every active subscription. */
  publish(): void {
    for (const listener of this.listeners) this.notifications.push([this.value, this.pending, listener]);
  }

  /** Enter origin only after the before hook succeeds. */
  startOrigin(id: number): void {
    this.phases.set(id, 'origin');
    this.publish();
    this.counts.origin++;
  }

  /** Finish cleanup before delivering completion. */
  finish(id: number): void { this.phases.set(id, 'finished'); this.publish(); }

  /** Apply one external event, ignoring settlements that cannot occur in the current phase. */
  apply(event: ModelEvent): void {
    const { kind, id } = event;
    const phase = this.phases.get(id);
    if (kind === 'subscribe') { this.listeners.add(id); return; }
    if (kind === 'unsubscribe') { this.listeners.delete(id); return; }
    if (kind === 'update') {
      if (!this.managers.has(id)) return;
      this.value++;
      if (phase === 'origin' || phase === 'finished') this.publish();
      return;
    }
    if (kind === 'call') {
      if (this.guarded && this.pending) return;
      this.phases.set(id, 'before');
      if (this.before !== 'none') { this.counts.before++; this.managers.add(id); }
      if (this.before !== 'async') this.startOrigin(id);
    } else if (kind === 'before' && phase === 'before') this.startOrigin(id);
    else if ((kind === 'origin' || kind === 'throw') && phase === 'origin') {
      this.phases.set(id, 'after');
      if (this.after !== 'none') { this.counts.after++; this.managers.add(id); }
      if (this.after !== 'async') this.finish(id);
    } else if (kind === 'after' && phase === 'after') this.finish(id);
  }
}
