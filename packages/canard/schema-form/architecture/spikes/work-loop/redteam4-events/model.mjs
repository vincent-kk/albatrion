/**
 * Independent model of round-4-spec.md §B (event system) and ADR 0008
 * "루트 디스패처" 1–6 / "통지의 시점". Built from the spec text only.
 *
 * Tree: leaf nodes hold `local`; object nodes emit `{key: child.emit}`.
 * Root owns the only dispatcher: marks → commit (one settle) → waves.
 * Every place the spec leaves a choice is a `policy` knob so an attack can
 * run both readings side by side.
 */
export const EV = {
  UpdateValue: 1,
  UpdateSettle: 2,
  RequestFocus: 4,
  RequestSelect: 8,
  RequestRefresh: 16,
};
export const WAVE_CAP = 25;

const NONE = Symbol('none');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export class Node {
  constructor(root, key, parent, isObject) {
    this.root = root ?? this;
    this.key = key;
    this.parent = parent;
    this.children = isObject ? [] : null;
    this.local = undefined;
    this.emitCache = isObject ? {} : undefined;
    this.staged = NONE;
    this.listeners = new Set();
    this.ledger = new Map();
    this.signals = 0;
    this.detached = false;
    this.settle = 'ok';
  }
  get path() {
    return this.parent ? `${this.parent.path}/${this.key}` : '';
  }
  /** Committed value (B3-4: `node.value` returns the current commit). */
  get value() {
    return this.children ? this.emitCache : this.local;
  }
  add(key, isObject = false) {
    const child = new Node(this.root, key, this, isObject);
    this.children.push(child);
    return child;
  }
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  revision(mask) {
    let n = 0;
    for (const [bit, c] of this.ledger) if (bit & mask) n += c;
    return n;
  }
  bump(mask) {
    for (let bit = 1; bit <= mask; bit <<= 1)
      if (bit & mask) this.ledger.set(bit, (this.ledger.get(bit) ?? 0) + 1);
  }
  setValue(v) {
    this.root.write(this, v);
  }
  publish(bit) {
    this.root.signal(this, bit);
  }
  /** Detach `child` from this object node; counts as a write on this node. */
  remove(child) {
    const i = this.children.indexOf(child);
    if (i < 0) return;
    this.children.splice(i, 1);
    const mark = (n) => {
      n.detached = true;
      n.children?.forEach(mark);
    };
    mark(child);
    this.root.write(this, NONE);
  }
}

export class Root extends Node {
  constructor(policy = {}) {
    super(null, '', null, true);
    this.policy = {
      capPolicy: 'deliver-last', // 'deliver-last' | 'drop'
      payloadMerge: 'last', // 'last' | 'span'  (two commits, one delivery)
      batchThrow: 'settle', // 'settle' | 'discard'
      batchDepthBeforeFlush: true, // decrement depth before or after flush
      bumpAllFirst: false, // B3-3 alternative
      microtaskNotify: false, // B2-1 counter-model: notify one microtask later
      ...policy,
    };
    this.batchDepth = 0;
    this.marks = new Set();
    this.pending = new Map();
    this.signalQueue = [];
    this.waveActive = false;
    this.waveCount = 0;
    this.commitCount = 0;
    this.errors = [];
    this.trace = [];
    this.onChange = null;
    this.capped = null;
  }
  write(node, v) {
    node.staged = v;
    this.marks.add(node);
    if (this.batchDepth > 0) return;
    this.flush();
  }
  signal(node, bit) {
    node.signals |= bit;
    if (!this.signalQueue.includes(node)) this.signalQueue.push(node);
    if (this.batchDepth > 0 || this.waveActive) return;
    this.flush();
  }
  batch(fn) {
    this.batchDepth++;
    let threw = null;
    try {
      fn();
    } catch (e) {
      threw = e;
    }
    if (this.policy.batchDepthBeforeFlush) this.batchDepth--;
    if (this.batchDepth === (this.policy.batchDepthBeforeFlush ? 0 : 1)) {
      if (threw && this.policy.batchThrow === 'discard') {
        for (const n of this.marks) n.staged = NONE;
        this.marks.clear();
      } else this.flush();
    }
    if (!this.policy.batchDepthBeforeFlush) this.batchDepth--;
    if (threw) throw threw;
  }
  /** One settle: commit every mark, collect changed nodes top→down. */
  flush() {
    const changed = [];
    const commitId = ++this.commitCount;
    const walk = (n) => {
      let payload = null;
      const slot = changed.length;
      changed.push(null);
      if (n.children) {
        const next = {};
        for (const c of n.children) {
          walk(c);
          next[c.key] = c.value;
        }
        if (!same(next, n.emitCache)) payload = { previous: n.emitCache, current: next };
        n.emitCache = next;
        n.staged = NONE;
      } else if (n.staged !== NONE) {
        if (!same(n.staged, n.local)) payload = { previous: n.local, current: n.staged };
        n.local = n.staged;
        n.staged = NONE;
      }
      if (payload) changed[slot] = [n, payload, commitId];
    };
    walk(this);
    const pre = changed.filter(Boolean);
    changed.length = 0;
    changed.push(...pre);
    this.marks.clear();
    const signalled = this.signalQueue;
    this.signalQueue = [];
    for (const [n, payload, cid] of changed) this.queue(n, EV.UpdateValue, payload, cid);
    for (const n of signalled) if (!this.pending.has(n)) this.queue(n, 0, null, commitId);
    if (changed.length && this.onChange) this.onChange(this.emitCache, commitId);
    if (this.waveActive) return;
    if (this.policy.microtaskNotify) queueMicrotask(() => this.runWaves());
    else this.runWaves();
  }
  queue(node, type, payload, commitId) {
    const prev = this.pending.get(node);
    if (prev && prev.payload && payload && this.policy.payloadMerge === 'span')
      payload = { previous: prev.payload.previous, current: payload.current };
    this.pending.set(node, {
      type: (prev?.type ?? 0) | type,
      payload: payload ?? prev?.payload ?? null,
      commitId,
    });
  }
  runWaves() {
    this.waveCount = 0;
    this.capped = null;
    while (this.pending.size) {
      this.waveCount++;
      const over = this.waveCount > WAVE_CAP;
      if (over && this.policy.capPolicy === 'drop') {
        this.capped = { dropped: [...this.pending.keys()].map((n) => n.path) };
        this.pending.clear();
        break;
      }
      const wave = [...this.pending];
      this.pending = new Map();
      this.waveActive = true;
      if (this.policy.bumpAllFirst)
        for (const [n, e] of wave) if (!n.detached) n.bump(e.type | n.signals);
      for (const [n, e] of wave) {
        if (n.detached) {
          n.signals = 0;
          this.trace.push(['skip-detached', n.path]);
          continue;
        }
        const type = e.type | n.signals;
        n.signals = 0;
        if (!this.policy.bumpAllFirst) n.bump(type);
        const event = { type, payload: e.payload, node: n, wave: this.waveCount, commitId: e.commitId };
        this.trace.push(['deliver', n.path, this.waveCount, e.payload]);
        for (const l of n.listeners) {
          try {
            l(event);
          } catch (err) {
            this.errors.push({ path: n.path, err });
          }
        }
      }
      this.waveActive = false;
      // signals published during the wave to nodes outside the fixed set
      for (const n of this.signalQueue) if (n.signals && !this.pending.has(n)) this.queue(n, 0, null, this.commitCount);
      this.signalQueue = [];
      if (over) {
        this.capped = { dropped: [...this.pending.keys()].map((n) => n.path) };
        this.pending.clear();
        this.settle = 'wave-cap';
        break;
      }
    }
  }
}

/** Preorder listing of paths, for asserting B3-1 order. */
export const order = (root) => {
  const out = [];
  const walk = (n) => {
    out.push(n.path);
    n.children?.forEach(walk);
  };
  walk(root);
  return out;
};

/** Build a flat object root with `n` string leaves f0..f(n-1). */
export const flat = (n, policy) => {
  const root = new Root(policy);
  for (let i = 0; i < n; i++) root.add(`f${i}`);
  root.flush();
  return root;
};
