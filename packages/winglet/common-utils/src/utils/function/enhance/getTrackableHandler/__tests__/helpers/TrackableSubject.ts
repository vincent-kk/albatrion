import { getTrackableHandler } from '../../getTrackableHandler';
import type { StateManager } from '../../type';
import type { HookMode, ModelEvent } from './TrackableModel';

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
  managers = new Map<number, StateManager<{ value: number }>>();
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
  notifications: Array<[number, boolean, number]> = [];
  /** Promise results are consumed immediately, including failed origins. */
  promises: Array<Promise<unknown>> = [];
  /** Public subject under test. */
  readonly handler;

  /** Construct the real public handler with controlled hooks and origin. */
  constructor(guarded: boolean, before: HookMode, after: HookMode) {
    this.handler = getTrackableHandler(async (id: number) => {
      this.counts.origin++;
      const settlement = new Settlement();
      this.originSettlements.set(id, settlement);
      await settlement.promise;
      return id;
    }, {
      initialState: { value: 0 }, preventConcurrent: guarded,
      beforeExecute: before === 'none' ? undefined : ([id], manager) => {
        this.counts.before++;
        this.managers.set(id, manager);
        if (before !== 'async') return;
        const settlement = new Settlement();
        this.beforeSettlements.set(id, settlement);
        return settlement.promise;
      },
      afterExecute: after === 'none' ? undefined : ([id], manager) => {
        this.counts.after++;
        this.managers.set(id, manager);
        if (after !== 'async') return;
        const settlement = new Settlement();
        this.afterSettlements.set(id, settlement);
        return settlement.promise;
      },
    });
  }

  /** Drive one command and let native Promise continuations quiesce. */
  async apply(event: ModelEvent): Promise<void> {
    const { kind, id } = event;
    if (kind === 'call') this.promises.push(this.handler(id).catch(() => undefined));
    else if (kind === 'before') this.beforeSettlements.get(id)?.resolve();
    else if (kind === 'origin') this.originSettlements.get(id)?.resolve();
    else if (kind === 'throw') this.originSettlements.get(id)?.reject(new Error('origin failure'));
    else if (kind === 'after') this.afterSettlements.get(id)?.resolve();
    else if (kind === 'update') this.managers.get(id)?.update(state => ({ value: state.value + 1 }));
    else if (kind === 'subscribe') {
      let subscription = this.subscriptions.get(id);
      if (!subscription) {
        const listener = () => this.notifications.push([this.handler.state.value, this.handler.pending, id]);
        subscription = { listener, remove: this.handler.subscribe(listener) };
        this.subscriptions.set(id, subscription);
      } else subscription.remove = this.handler.subscribe(subscription.listener);
    } else if (kind === 'unsubscribe') this.subscriptions.get(id)?.remove();
    for (let tick = 0; tick < 12; tick++) await Promise.resolve();
  }
}
