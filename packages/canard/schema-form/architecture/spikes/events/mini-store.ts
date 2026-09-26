/**
 * Standalone mini store for the B2-1 / B2-2 caret spike. No dependency on the
 * library. Models the round-4 spec §B2/§B3 shape: a write settles
 * synchronously; notification is either synchronous (mode `sync`, the spec) or
 * deferred to one queued microtask (mode `microtask`, the counterexample).
 *
 * Dispatch follows §B3-4: a wave iterates a fixed set; a write issued inside a
 * listener commits immediately and is notified in the next wave; the ledger
 * (`revision`) rises right before a node's listeners are called (§B3-3).
 */

export type NotifyMode = 'sync' | 'microtask';

export interface UpdatePayload<T> {
  previous: T;
  current: T;
}

export type Listener<T> = (payload: UpdatePayload<T>) => void;

export class StoreNode<T> {
  value: T;
  /** Monotonic count of deliveries — the useSyncExternalStore snapshot. */
  revision = 0;
  private readonly listeners = new Set<Listener<T>>();

  constructor(
    readonly name: string,
    initial: T,
    private readonly store: MiniStore,
  ) {
    this.value = initial;
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setValue(value: T): void {
    this.store.setValue(this, value);
  }

  /** Called by the store dispatcher only. */
  __deliver__(previous: T, current: T): void {
    this.revision++;
    for (const listener of [...this.listeners]) {
      try {
        listener({ previous, current });
      } catch (error) {
        this.store.listenerErrors.push(error);
      }
    }
  }
}

export class MiniStore {
  readonly nodes = new Map<string, StoreNode<any>>();
  /** Errors thrown by listeners (isolated per §B3-6). */
  readonly listenerErrors: unknown[] = [];
  /** Waves run by the most recent dispatch. */
  waves = 0;
  /** Count of dispatches that hit the wave cap. */
  overflow = 0;
  /** Total dispatch runs (one per synchronous notify or per drained microtask). */
  dispatches = 0;
  readonly maxWaves = 25;

  private readonly pending = new Map<StoreNode<any>, unknown>();
  private inWave = false;
  private batchDepth = 0;
  private scheduled = false;

  constructor(readonly mode: NotifyMode) {}

  createNode<T>(name: string, initial: T): StoreNode<T> {
    const node = new StoreNode<T>(name, initial, this);
    this.nodes.set(name, node);
    return node;
  }

  /** Commits synchronously; notification timing depends on `mode`. */
  setValue<T>(node: StoreNode<T>, value: T): void {
    if (!this.pending.has(node)) this.pending.set(node, node.value);
    node.value = value;
    if (this.batchDepth > 0 || this.inWave) return;
    this.dispatch();
  }

  /** Marks writes inside `fn`; settles once and dispatches once at the end. */
  batch(fn: () => void): void {
    this.batchDepth++;
    try {
      fn();
    } finally {
      this.batchDepth--;
    }
    if (this.batchDepth === 0 && !this.inWave && this.pending.size > 0)
      this.dispatch();
  }

  private dispatch(): void {
    if (this.mode === 'sync') {
      this.runWaves();
      return;
    }
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      this.runWaves();
    });
  }

  private runWaves(): void {
    this.inWave = true;
    this.dispatches++;
    this.waves = 0;
    try {
      while (this.pending.size > 0) {
        if (this.waves >= this.maxWaves) {
          this.overflow++;
          this.pending.clear();
          break;
        }
        const wave = [...this.pending];
        this.pending.clear();
        this.waves++;
        for (const [node, previous] of wave)
          node.__deliver__(previous, node.value);
      }
    } finally {
      this.inWave = false;
    }
  }
}
