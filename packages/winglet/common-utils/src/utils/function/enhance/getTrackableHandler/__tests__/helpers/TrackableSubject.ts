import { getTrackableHandler } from '../../getTrackableHandler';
import type { StateManager } from '../../type';
import type { CallbackPlan, HookMode, ModelEvent, OriginMode } from './TrackableModel';

/** Explicitly controlled thenable endpoint for one lifecycle stage. */
class Settlement {
  /** Settle successfully; initialized by the synchronous Promise executor. */
  resolve!: () => void;
  /** Fail the origin without leaving an unhandled rejection. */
  reject!: (error: Error) => void;
  /** Promise awaited by the subject's real lifecycle. */
  readonly promise = new Promise<void>((resolve, reject) => { this.resolve = resolve; this.reject = reject; });
}

/** Real handler adapter; deliberately has no notification suppression logic. */
export class TrackableSubject {
  /** Call-owned state managers, retained after completion. */
  managers = new Map<number, StateManager<{ value?: number }>>();
  /** Pending before hooks. */
  beforeSettlements = new Map<number, Settlement>();
  /** Pending origins. */
  originSettlements = new Map<number, Settlement>();
  /** Pending after hooks. */
  afterSettlements = new Map<number, Settlement>();
  /** Observed lifecycle invocation counts. */
  counts = { before: 0, origin: 0, after: 0 };
  /** Subscription identity and corresponding removers. */
  subscriptions = new Map<number, { listener: () => void; remove: () => void }>();
  /** Published snapshots in actual listener invocation order. */
  notifications: Array<[number | undefined, boolean, number]> = [];
  /** Promise results are consumed immediately, including failed origins. */
  promises: Array<Promise<unknown>> = [];
  /** Public subject under test. */
  readonly handler;

  /** One-shot callback indices already entered. */
  callbacksRun = new Set<number>();

  /** Construct the real public handler with controlled hooks and origin. */
  constructor(guarded: boolean, readonly before: HookMode, readonly after: HookMode, readonly origin: OriginMode = 'async', initialState = true, readonly callbacks: readonly CallbackPlan[] = []) {
    this.handler = getTrackableHandler<[number], number, { value?: number }>((id: number): Promise<number> => {
      this.counts.origin++;
      this.runCallbacks('origin', id);
      if (origin === 'throw') throw new Error('origin failure');
      const settlement = new Settlement();
      this.originSettlements.set(id, settlement);
      return settlement.promise.then(() => id);
    }, {
      initialState: initialState ? { value: 0 } : undefined, preventConcurrent: guarded,
      beforeExecute: before === 'none' ? undefined : ([id], manager) => {
        this.counts.before++;
        this.managers.set(id, manager);
        this.runCallbacks('before', id);
        if (before === 'throw') throw new Error('before failure');
        if (before === 'sync') return;
        const settlement = new Settlement();
        this.beforeSettlements.set(id, settlement);
        return before === 'thenable' ? { then: (resolve: () => void, reject: (error: Error) => void) => settlement.promise.then(resolve, reject) } : settlement.promise;
      },
      afterExecute: after === 'none' ? undefined : ([id], manager) => {
        this.counts.after++;
        this.managers.set(id, manager);
        this.runCallbacks('after', id);
        if (after === 'throw') throw new Error('after failure');
        if (after === 'sync') return;
        const settlement = new Settlement();
        this.afterSettlements.set(id, settlement);
        return after === 'thenable' ? { then: (resolve: () => void, reject: (error: Error) => void) => settlement.promise.then(resolve, reject) } : settlement.promise;
      },
    });
  }

  /** Execute user actions synchronously, as hooks and listeners do. */
  runCallbacks(site: CallbackPlan['site'], id: number): void {
    this.callbacks.forEach((plan, index) => {
      if (plan.site !== site || plan.id !== id || this.callbacksRun.has(index)) return;
      this.callbacksRun.add(index);
      for (const event of plan.events) { try { this.dispatch(event); } catch { /* The generated user callback catches nested update failures. */ } }
      if (plan.throws) throw new Error('callback');
    });
  }

  /** Invoke one synchronous command without draining continuations. */
  dispatch(event: ModelEvent): void {
    const { kind, id } = event;
    if (kind === 'call') this.promises.push(this.handler(id).catch(() => undefined));
    else if (kind === 'before' && this.before !== 'never') {
      if (this.before === 'reject') this.beforeSettlements.get(id)?.reject(new Error('before failure'));
      else this.beforeSettlements.get(id)?.resolve();
    } else if (kind === 'origin' && this.origin !== 'never') {
      if (this.origin === 'reject') this.originSettlements.get(id)?.reject(new Error('origin failure'));
      else this.originSettlements.get(id)?.resolve();
    } else if (kind === 'throw' && this.origin !== 'never') this.originSettlements.get(id)?.reject(new Error('origin failure'));
    else if (kind === 'after' && this.after !== 'never') {
      if (this.after === 'reject') this.afterSettlements.get(id)?.reject(new Error('after failure'));
      else this.afterSettlements.get(id)?.resolve();
    }
    else if (kind === 'update') this.managers.get(id)?.update(state => ({ value: (state.value ?? 0) + 1 }));
    else if (kind === 'equal') this.managers.get(id)?.update(state => state);
    else if (kind === 'empty') this.managers.get(id)?.update({});
    else if (kind === 'updateThrow') {
      try { this.managers.get(id)?.update(() => { throw new Error('updater'); }); }
      catch (error) { if (!(error instanceof Error) || error.message !== 'updater') throw error; }
    }
    else if (kind === 'subscribe') {
      let subscription = this.subscriptions.get(id);
      if (!subscription) {
        const listener = () => {
          this.notifications.push([this.handler.state.value, this.handler.pending, id]);
          this.runCallbacks('publish', id);
        };
        subscription = { listener, remove: this.handler.subscribe(listener) };
        this.subscriptions.set(id, subscription);
      } else subscription.remove = this.handler.subscribe(subscription.listener);
    } else if (kind === 'unsubscribe') this.subscriptions.get(id)?.remove();
  }

  /** Drive one command and let native Promise continuations quiesce. */
  async apply(event: ModelEvent): Promise<void> {
    try { this.dispatch(event); } catch { /* External callers catch synchronous update failures. */ }
    for (let tick = 0; tick < 12; tick++) await Promise.resolve();
  }
}
